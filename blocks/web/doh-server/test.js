import { describe, it, expect } from '../../../test/test-harness.js';
import { DoHServer } from './index.js';
import http from 'http';

await describe('web/doh-server', async () => {
  await it('should parse a DNS POST request and return the resolved IP in the response', () => {
    return new Promise((resolve, reject) => {
      const records = { 'example.com': '1.2.3.4' };
      const doh = new DoHServer({ records });

      doh.listen(0, () => {
        const port = doh.server.address().port;

        // Build a mock DNS query for example.com (type A)
        // Header: Transaction ID (0x1234), Flags (0x0100), QDCOUNT (1), ANCOUNT (0), NSCOUNT (0), ARCOUNT (0)
        const header = Buffer.from([
          0x12, 0x34, // ID
          0x01, 0x00, // Flags (standard query)
          0x00, 0x01, // QDCOUNT (1)
          0x00, 0x00, // ANCOUNT (0)
          0x00, 0x00, // NSCOUNT (0)
          0x00, 0x00  // ARCOUNT (0)
        ]);

        // Question: "example.com"
        // 7example3com0 + QTYPE A (1) + QCLASS IN (1)
        const question = Buffer.from([
          7, 0x65, 0x78, 0x61, 0x6d, 0x70, 0x6c, 0x65, // example
          3, 0x63, 0x6f, 0x6d,                         // com
          0,                                           // null terminator
          0, 1,                                        // QTYPE A
          0, 1                                         // QCLASS IN
        ]);

        const dnsQuery = Buffer.concat([header, question]);

        // Send POST request
        const options = {
          hostname: 'localhost',
          port: port,
          path: '/dns-query',
          method: 'POST',
          headers: {
            'Content-Type': 'application/dns-message',
            'Content-Length': dnsQuery.length
          }
        };

        const req = http.request(options, (res) => {
          const bodyChunks = [];
          res.on('data', chunk => bodyChunks.push(chunk));
          res.on('end', () => {
            try {
              expect(res.statusCode).toBe(200);
              expect(res.headers['content-type']).toBe('application/dns-message');

              const responseBuffer = Buffer.concat(bodyChunks);
              
              // Validate response transaction ID
              const respTxId = responseBuffer.readUInt16BE(0);
              expect(respTxId).toBe(0x1234);

              // Validate resolved IP in the last 4 bytes
              const len = responseBuffer.length;
              const ip = `${responseBuffer[len-4]}.${responseBuffer[len-3]}.${responseBuffer[len-2]}.${responseBuffer[len-1]}`;
              expect(ip).toBe('1.2.3.4');

              doh.close(() => resolve());
            } catch (e) {
              doh.close(() => reject(e));
            }
          });
        });

        req.on('error', (err) => {
          doh.close(() => reject(err));
        });

        req.write(dnsQuery);
        req.end();
      });
    });
  });
});
