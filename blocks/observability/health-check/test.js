import { describe, it, expect } from '../../../test/test-harness.js';
import { HealthChecker } from './index.js';

describe('observability/health-check – HealthChecker', () => {
  it('should pass and aggregate status as UP when all checks pass', async () => {
    const checker = new HealthChecker();
    checker.register('db', () => true);
    checker.register('cache', async () => ({ status: 'UP', items: 120 }));

    const res = await checker.check();
    expect(res.status).toBe('UP');
    expect(res.details.db.status).toBe('UP');
    expect(res.details.cache.status).toBe('UP');
    expect(res.details.cache.data.items).toBe(120);
  });

  it('should mark overall status DOWN if any check fails or throws', async () => {
    const checker = new HealthChecker();
    checker.register('db', () => true);
    checker.register('redis', () => false);
    checker.register('api', async () => { throw new Error('connection refused'); });

    const res = await checker.check();
    expect(res.status).toBe('DOWN');
    expect(res.details.db.status).toBe('UP');
    expect(res.details.redis.status).toBe('DOWN');
    expect(res.details.api.status).toBe('DOWN');
    expect(res.details.api.error).toContain('connection refused');
  });

  it('should handle timeout by marking check as DOWN', async () => {
    const checker = new HealthChecker();
    checker.register('slow-db', () => new Promise(resolve => setTimeout(resolve, 500)), 50);

    const res = await checker.check();
    expect(res.status).toBe('DOWN');
    expect(res.details['slow-db'].status).toBe('DOWN');
    expect(res.details['slow-db'].error).toContain('Timeout');
  });

  it('should produce a working HTTP server response handler', async () => {
    const checker = new HealthChecker();
    checker.register('simple', () => true);

    const handler = checker.getHandler();
    let writtenStatus = null;
    let writtenHeaders = null;
    let writtenBody = null;

    const mockRes = {
      writeHead(status, headers) {
        writtenStatus = status;
        writtenHeaders = headers;
      },
      end(body) {
        writtenBody = body;
      }
    };

    await handler({}, mockRes);
    expect(writtenStatus).toBe(200);
    expect(writtenHeaders['Content-Type']).toBe('application/json');
    
    const parsed = JSON.parse(writtenBody);
    expect(parsed.status).toBe('UP');
    expect(parsed.details.simple.status).toBe('UP');
  });
});
