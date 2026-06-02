import { describe, it, expect } from '../../../test/test-harness.js';
import {buildQuery, parseResponse} from './index.js';

  await describe('protocol/dns-resolver', async () => {
    await it('should pack DNS queries binary packets and unpack standard responses correctly', () => {
      // 1. Pack test
      const queryBuf = buildQuery('google.com', 'A');
      expect(queryBuf instanceof Buffer).toBe(true);
      expect(queryBuf.length > 12).toBe(true);

      // 2. Unpack test using a mock raw response packet
      const responseBuf = Buffer.alloc(64);
      responseBuf.writeUInt16BE(0x1234, 0); // Transaction ID
      responseBuf.writeUInt16BE(0x8180, 2); // Flags: standard response
      responseBuf.writeUInt16BE(1, 4);      // QDCOUNT
      responseBuf.writeUInt16BE(1, 6);      // ANCOUNT
      
      // Question section: "google.com" echo
      let offset = 12;
      responseBuf.writeUInt8(6, offset);
      responseBuf.write('google', offset + 1, 'ascii');
      offset += 7;
      responseBuf.writeUInt8(3, offset);
      responseBuf.write('com', offset + 1, 'ascii');
      offset += 4;
      responseBuf.writeUInt8(0, offset); // Null terminator
      offset += 1;
      responseBuf.writeUInt16BE(1, offset); // QTYPE: A
      responseBuf.writeUInt16BE(1, offset + 2); // QCLASS: IN
      offset += 4;

      // Answer section: compression pointer to name at offset 12 (0xC00C)
      responseBuf.writeUInt16BE(0xC00C, offset);
      responseBuf.writeUInt16BE(1, offset + 2); // TYPE: A
      responseBuf.writeUInt16BE(1, offset + 4); // CLASS: IN
      responseBuf.writeUInt32BE(300, offset + 6); // TTL
      responseBuf.writeUInt16BE(4, offset + 10); // RDLENGTH: 4 bytes IP
      responseBuf.writeUInt8(142, offset + 12);
      responseBuf.writeUInt8(250, offset + 13);
      responseBuf.writeUInt8(190, offset + 14);
      responseBuf.writeUInt8(46, offset + 15);

      const parsed = parseResponse(responseBuf);
      expect(parsed.answers.length).toBe(1);
      expect(parsed.answers[0].name).toBe('google.com');
      expect(parsed.answers[0].type).toBe('A');
      expect(parsed.answers[0].data).toBe('142.250.190.46');
    });
  });
