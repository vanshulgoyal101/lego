/**
 * Custom DNS Client and Packet Parser.
 * Features:
 * 1. Low-level binary DNS packet packer (Headers, flags, label-length domain encoder).
 * 2. Response parser decoding DNS structures (A, AAAA, CNAME, MX, TXT).
 * 3. Domain pointer decompression (resolving recursive pointer offsets).
 * 4. Custom UDP socket client querying public DNS nameservers (e.g. Google 8.8.8.8, Cloudflare 1.1.1.1).
 * 5. Deterministic encoders/decoders to test packet buffers offline.
 */

import dgram from 'dgram';

// --- DNS Record Type Mappings ---
export const DNS_TYPES = {
  A: 1,
  NS: 2,
  CNAME: 5,
  SOA: 6,
  MX: 15,
  TXT: 16,
  AAAA: 28
};

const DNS_TYPE_NAMES = Object.fromEntries(
  Object.entries(DNS_TYPES).map(([k, v]) => [v, k])
);

// --- 1. DNS Query Packet Builder ---
export function buildQuery(domain, typeStr = 'A') {
  const type = DNS_TYPES[typeStr.toUpperCase()];
  if (!type) throw new Error(`UnsupportedRecordTypeError: type "${typeStr}" is not mapped.`);

  const header = Buffer.alloc(12);
  const transactionId = Math.floor(Math.random() * 0xFFFF);
  
  header.writeUInt16BE(transactionId, 0);  // Transaction ID
  header.writeUInt16BE(0x0100, 2);         // Flags: Standard query, recursion desired
  header.writeUInt16BE(1, 4);              // Questions count: 1
  header.writeUInt16BE(0, 6);              // Answers count: 0
  header.writeUInt16BE(0, 8);              // Authority count: 0
  header.writeUInt16BE(0, 10);             // Additional count: 0

  // Encode domain name: "google.com" -> [6, 'g','o','o','g','l','e', 3, 'c','o','m', 0]
  const qnameParts = [];
  const labels = domain.split('.');
  for (const label of labels) {
    if (label.length > 63) throw new Error('LabelLimitExceeded: DNS labels cannot exceed 63 characters.');
    const labelBuf = Buffer.alloc(1 + label.length);
    labelBuf.writeUInt8(label.length, 0);
    labelBuf.write(label, 1, 'ascii');
    qnameParts.push(labelBuf);
  }
  const nullByte = Buffer.from([0]);
  const qname = Buffer.concat([...qnameParts, nullByte]);

  const qtypeClass = Buffer.alloc(4);
  qtypeClass.writeUInt16BE(type, 0);       // QTYPE
  qtypeClass.writeUInt16BE(1, 2);          // QCLASS: IN (Internet)

  return Buffer.concat([header, qname, qtypeClass]);
}

// --- 2. DNS Response Packet Parser ---
export function parseResponse(buffer) {
  let offset = 0;

  // Header Section
  if (buffer.length < 12) throw new Error('ResponseBufferUnderflow: Packet header must be 12 bytes.');
  const id = buffer.readUInt16BE(offset);
  const flags = buffer.readUInt16BE(offset + 2);
  const qdcount = buffer.readUInt16BE(offset + 4);
  const ancount = buffer.readUInt16BE(offset + 6);
  const nscount = buffer.readUInt16BE(offset + 8);
  const arcount = buffer.readUInt16BE(offset + 10);
  offset += 12;

  const rcode = flags & 0x000F;
  if (rcode !== 0) {
    throw new Error(`DNSServerError: Return code error ${rcode}.`);
  }

  // Helper: Read Domain Name (supporting compression pointers)
  const readName = (currentOffset) => {
    const parts = [];
    let ptrVisited = false;
    let localOffset = currentOffset;
    let finalOffset = null;

    while (true) {
      const len = buffer.readUInt8(localOffset);
      if (len === 0) {
        if (!ptrVisited) finalOffset = localOffset + 1;
        break;
      }

      // Check if it's a compression pointer (starts with bits 11xxxxx)
      if ((len & 0xC0) === 0xC0) {
        const ptr = buffer.readUInt16BE(localOffset) & 0x3FFF;
        if (!ptrVisited) {
          finalOffset = localOffset + 2;
          ptrVisited = true;
        }
        localOffset = ptr; // Jump to compression target
        continue;
      }

      localOffset += 1;
      const part = buffer.toString('ascii', localOffset, localOffset + len);
      parts.push(part);
      localOffset += len;
    }

    return { name: parts.join('.'), nextOffset: finalOffset };
  };

  // Skip Question Echoes
  for (let i = 0; i < qdcount; i++) {
    const qnameRes = readName(offset);
    offset = qnameRes.nextOffset + 4; // Skip QTYPE and QCLASS
  }

  // Parse Resource Records
  const parseRecords = (count) => {
    const records = [];
    for (let i = 0; i < count; i++) {
      const nameRes = readName(offset);
      offset = nameRes.nextOffset;

      const type = buffer.readUInt16BE(offset);
      const cls = buffer.readUInt16BE(offset + 2);
      const ttl = buffer.readUInt32BE(offset + 4);
      const rdlen = buffer.readUInt16BE(offset + 8);
      offset += 10;

      const rdataOffset = offset;
      offset += rdlen;

      let rdata = null;
      const typeName = DNS_TYPE_NAMES[type] || 'UNKNOWN';

      if (type === DNS_TYPES.A && rdlen === 4) {
        // Parse IPv4 address
        rdata = `${buffer.readUInt8(rdataOffset)}.${buffer.readUInt8(rdataOffset + 1)}.${buffer.readUInt8(rdataOffset + 2)}.${buffer.readUInt8(rdataOffset + 3)}`;
      } else if (type === DNS_TYPES.AAAA && rdlen === 16) {
        // Parse IPv6 address
        const blocks = [];
        for (let j = 0; j < 16; j += 2) {
          blocks.push(buffer.readUInt16BE(rdataOffset + j).toString(16));
        }
        rdata = blocks.join(':').replace(/(^|:)0(:0)+(:|$)/, '::'); // Simple shortener
      } else if (type === DNS_TYPES.CNAME || type === DNS_TYPES.NS) {
        rdata = readName(rdataOffset).name;
      } else if (type === DNS_TYPES.MX) {
        const pref = buffer.readUInt16BE(rdataOffset);
        const exchange = readName(rdataOffset + 2).name;
        rdata = { preference: pref, exchange };
      } else if (type === DNS_TYPES.TXT) {
        const textParts = [];
        let txtIdx = rdataOffset;
        while (txtIdx < rdataOffset + rdlen) {
          const txtLen = buffer.readUInt8(txtIdx);
          txtIdx += 1;
          textParts.push(buffer.toString('ascii', txtIdx, txtIdx + txtLen));
          txtIdx += txtLen;
        }
        rdata = textParts.join('');
      } else {
        rdata = buffer.slice(rdataOffset, rdataOffset + rdlen);
      }

      records.push({
        name: nameRes.name,
        type: typeName,
        class: cls === 1 ? 'IN' : cls,
        ttl,
        data: rdata
      });
    }
    return records;
  };

  const answers = parseRecords(ancount);
  const authorities = parseRecords(nscount);
  const additionals = parseRecords(arcount);

  return {
    id,
    flags,
    answers,
    authorities,
    additionals
  };
}

// --- 3. DNS Resolver Client Interface ---
/**
 * Query nameservers for DNS record configurations.
 */
export function resolveDns(domain, typeStr = 'A', nameserver = '8.8.8.8', port = 53, timeoutMs = 4000) {
  return new Promise((resolve, reject) => {
    const client = dgram.createSocket('udp4');
    let timer = null;

    const cleanup = () => {
      clearTimeout(timer);
      client.close();
    };

    try {
      const msg = buildQuery(domain, typeStr);
      
      timer = setTimeout(() => {
        cleanup();
        reject(new Error(`DNSTimeoutError: Query to nameserver "${nameserver}" timed out after ${timeoutMs}ms.`));
      }, timeoutMs);

      client.on('message', (msg) => {
        cleanup();
        try {
          const res = parseResponse(msg);
          resolve(res);
        } catch (err) {
          reject(err);
        }
      });

      client.on('error', (err) => {
        cleanup();
        reject(err);
      });

      client.send(msg, 0, msg.length, port, nameserver, (err) => {
        if (err) {
          cleanup();
          reject(err);
        }
      });
    } catch (err) {
      cleanup();
      reject(err);
    }
  });
}
