import { describe, it, expect } from '../../../test/test-harness.js';
import { LoadBalancer } from './index.js';
import http from 'http';

await describe('web/load-balancer', async () => {
  await it('should distribute requests round-robin across healthy backends', () => {
    return new Promise((resolve, reject) => {
      const server1Hits = [];
      const server2Hits = [];

      const s1 = http.createServer((req, res) => {
        server1Hits.push(req.url);
        res.writeHead(200);
        res.end('s1');
      });

      const s2 = http.createServer((req, res) => {
        server2Hits.push(req.url);
        res.writeHead(200);
        res.end('s2');
      });

      s1.listen(0, () => {
        const port1 = s1.address().port;
        s2.listen(0, () => {
          const port2 = s2.address().port;

          const targets = [`http://localhost:${port1}`, `http://localhost:${port2}`];
          const lb = new LoadBalancer({ targets, policy: 'round-robin' });

          lb.listen(0, () => {
            const lbPort = lb.server.address().port;

            // Make 4 requests
            const makeRequest = (i) => {
              return new Promise((resResolve, resReject) => {
                http.get(`http://localhost:${lbPort}/req-${i}`, (res) => {
                  let body = '';
                  res.on('data', chunk => { body += chunk; });
                  res.on('end', () => {
                    resResolve(body);
                  });
                }).on('error', resReject);
              });
            };

            Promise.all([makeRequest(1), makeRequest(2), makeRequest(3), makeRequest(4)])
              .then((responses) => {
                try {
                  // Round robin means s1 and s2 should both get 2 requests, alternated
                  expect(server1Hits.length).toBe(2);
                  expect(server2Hits.length).toBe(2);
                  
                  // Now test health change manually
                  lb.healthy.set(targets[0], false); // manually mark target 1 dead

                  makeRequest(5).then((body) => {
                    try {
                      // Should only hit s2 since s1 is marked unhealthy
                      expect(body).toBe('s2');
                      expect(server2Hits.length).toBe(3);

                      // Cleanup
                      lb.close(() => {
                        s1.close(() => {
                          s2.close(() => {
                            resolve();
                          });
                        });
                      });
                    } catch (e) {
                      cleanupAndReject(e);
                    }
                  }).catch(cleanupAndReject);
                } catch (e) {
                  cleanupAndReject(e);
                }
              })
              .catch(cleanupAndReject);

            function cleanupAndReject(e) {
              lb.close(() => {
                s1.close(() => {
                  s2.close(() => {
                    reject(e);
                  });
                });
              });
            }
          });
        });
      });
    });
  });
});
