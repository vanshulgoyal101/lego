import http from 'http';
import { URL } from 'url';

export class DoHServer {
  /**
   * @param {Object} [options]
   * @param {Object} [options.records] - Custom DNS mapping, e.g. { 'example.com': '93.184.216.34' }
   */
  constructor(options = {}) {
    this.records = options.records || {};
    this.server = null;
  }

  /**
   * Decode base64url string to Buffer.
   */
  _base64UrlDecode(str) {
    let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }
    return Buffer.from(base64, 'base64');
  }

  /**
   * Parse a basic DNS query header & question section.
   * Extracts transaction ID and domain name.
   */
  _parseDNSQuery(buffer) {
    if (buffer.length < 12) {
      throw new Error('DNS packet too short');
    }

    const txId = buffer.readUInt16BE(0);
    // Question count is at offset 4
    const qCount = buffer.readUInt16BE(4);
    if (qCount === 0) {
      throw new Error('No questions in DNS query');
    }

    // Read question domain starting at offset 12
    let offset = 12;
    const parts = [];
    while (offset < buffer.length) {
      const len = buffer[offset];
      if (len === 0) {
        offset++;
        break;
      }
      if (offset + 1 + len > buffer.length) {
        throw new Error('Malformed DNS domain name');
      }
      parts.push(buffer.slice(offset + 1, offset + 1 + len).toString('ascii'));
      offset += 1 + len;
    }

    const domainName = parts.join('.');
    const qType = buffer.readUInt16BE(offset); // e.g. 1 for A, 28 for AAAA
    
    return { txId, domainName, qType, endOffset: offset + 4 };
  }

  /**
   * Builds a simple DNS A response packet.
   */
  _buildDNSAResponse(txId, queryBuffer, queryEndOffset, ipString) {
    // Basic response header: Response, Opcode 0, Authoritative, Recursion Desired, Recursion Available, No Error
    const header = Buffer.alloc(12);
    header.writeUInt16BE(txId, 0);       // ID
    header.writeUInt16BE(0x8180, 2);   // Flags
    header.writeUInt16BE(1, 4);        // QDCOUNT (Questions)
    header.writeUInt16BE(1, 6);        // ANCOUNT (Answer Count)
    header.writeUInt16BE(0, 8);        // NSCOUNT
    header.writeUInt16BE(0, 10);       // ARCOUNT

    // The question section is echoed back
    const question = queryBuffer.slice(12, queryEndOffset);

    // Answer: Name pointer offset 12 (0xc00c), Type A (1), Class IN (1), TTL (60s), RDLENGTH (4), RDATA (IP)
    const answer = Buffer.alloc(16);
    answer.writeUInt16BE(0xc00c, 0); // Pointer to domain name in question section
    answer.writeUInt16BE(1, 2);      // TYPE A
    answer.writeUInt16BE(1, 4);      // CLASS IN
    answer.writeUInt32BE(60, 6);     // TTL (60 seconds)
    answer.writeUInt16BE(4, 10);     // RDLENGTH

    const ipParts = ipString.split('.').map(Number);
    for (let i = 0; i < 4; i++) {
      answer.writeUInt8(ipParts[i], 12 + i);
    }

    return Buffer.concat([header, question, answer]);
  }

  /**
   * Route handler to process HTTP DoH requests.
   */
  async handle(req, res) {
    const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const method = req.method.toUpperCase();

    let queryBuffer = null;

    try {
      if (method === 'GET') {
        const dnsParam = parsedUrl.searchParams.get('dns');
        if (!dnsParam) {
          res.writeHead(400, { 'Content-Type': 'text/plain' });
          res.end('Missing dns query parameter');
          return;
        }
        queryBuffer = this._base64UrlDecode(dnsParam);
      } else if (method === 'POST') {
        const bodyChunks = [];
        for await (const chunk of req) {
          bodyChunks.push(chunk);
        }
        queryBuffer = Buffer.concat(bodyChunks);
      } else {
        res.writeHead(405, { 'Content-Type': 'text/plain' });
        res.end('Method Not Allowed');
        return;
      }

      const { txId, domainName, qType, endOffset } = this._parseDNSQuery(queryBuffer);

      // Resolve IP (default to localhost if not found)
      const ip = this.records[domainName] || '127.0.0.1';
      const dnsResponse = this._buildDNSAResponse(txId, queryBuffer, endOffset, ip);

      res.writeHead(200, {
        'Content-Type': 'application/dns-message',
        'Content-Length': dnsResponse.length,
        'Cache-Control': 'max-age=60'
      });
      res.end(dnsResponse);
    } catch (err) {
      res.writeHead(400, { 'Content-Type': 'text/plain' });
      res.end(`Bad Request: ${err.message}`);
    }
  }

  /**
   * Listen on a standalone HTTP server.
   */
  listen(port, callback) {
    this.server = http.createServer((req, res) => {
      this.handle(req, res);
    });
    this.server.listen(port, callback);
    return this;
  }

  close(callback) {
    if (this.server) {
      this.server.close(callback);
    }
  }
}
