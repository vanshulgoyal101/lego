import { describe, it, expect } from '../../../test/test-harness.js';
import {CorsMiddleware} from './index.js';

  await describe('web/cors-middleware', async () => {
    await it('should allow configured origin and methods', () => {
      const middleware = new CorsMiddleware({ origin: 'http://allowed.com', methods: ['POST'] });
      
      const req = {
        headers: { origin: 'http://allowed.com' },
        method: 'GET'
      };
      const res = {
        headers: {},
        setHeader(k, v) { this.headers[k.toLowerCase()] = v; }
      };

      middleware.handle(req, res);
      expect(res.headers['access-control-allow-origin']).toBe('http://allowed.com');
    });

    await it('should handle preflight options request', () => {
      const middleware = new CorsMiddleware({ origin: '*', methods: ['GET', 'POST'] });
      let ended = false;
      const req = {
        headers: { origin: 'http://test.com', 'access-control-request-headers': 'x-custom' },
        method: 'OPTIONS'
      };
      const res = {
        headers: {},
        setHeader(k, v) { this.headers[k.toLowerCase()] = v; },
        end() { ended = true; }
      };

      middleware.handle(req, res);
      expect(res.statusCode).toBe(204);
      expect(res.headers['access-control-allow-origin']).toBe('*');
      expect(res.headers['access-control-allow-methods']).toBe('GET, POST');
      expect(res.headers['access-control-allow-headers']).toBe('x-custom');
      expect(ended).toBeTruthy();
    });
  });
