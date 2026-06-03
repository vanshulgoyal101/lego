import { describe, it, expect } from '../../../test/test-harness.js';
import { ReverseProxy } from './index.js';
import http from 'http';

await describe('web/reverse-proxy', async () => {
  await it('should proxy requests successfully to a target server', () => {
    return new Promise((resolve, reject) => {
      // 1. Create target server
      const targetServer = http.createServer((req, res) => {
        res.writeHead(200, { 'Content-Type': 'application/json', 'X-Mock-Header': 'target-value' });
        res.end(JSON.stringify({ message: 'Hello from target', url: req.url, method: req.method }));
      });

      targetServer.listen(0, () => {
        const targetPort = targetServer.address().port;
        const targetUrl = `http://localhost:${targetPort}`;

        // 2. Create reverse proxy server
        const proxy = new ReverseProxy({ target: targetUrl });

        proxy.listen(0, () => {
          const proxyPort = proxy.server.address().port;

          // 3. Send test request to proxy
          const options = {
            hostname: 'localhost',
            port: proxyPort,
            path: '/some/path?query=1',
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            }
          };

          const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
              try {
                expect(res.statusCode).toBe(200);
                expect(res.headers['x-mock-header']).toBe('target-value');

                const parsed = JSON.parse(data);
                expect(parsed.message).toBe('Hello from target');
                expect(parsed.url).toBe('/some/path?query=1');
                expect(parsed.method).toBe('POST');

                // Cleanup
                proxy.close(() => {
                  targetServer.close(() => {
                    resolve();
                  });
                });
              } catch (e) {
                proxy.close(() => {
                  targetServer.close(() => {
                    reject(e);
                  });
                });
              }
            });
          });

          req.on('error', (err) => {
            proxy.close(() => {
              targetServer.close(() => {
                reject(err);
              });
            });
          });

          req.write(JSON.stringify({ key: 'val' }));
          req.end();
        });
      });
    });
  });
});
