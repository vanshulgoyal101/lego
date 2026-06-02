import { describe, it, expect } from '../../../test/test-harness.js';
import {HttpClient} from './index.js';

  await describe('web/http-client-resilient', async () => {
    await it('should handle interceptor hooks, cache hits, and circuit-breaker triggers', async () => {
      const client = new HttpClient({
        defaultCacheTtl: 5000,
        failureThreshold: 2,
        recoveryTimeout: 50
      });

      // Inject mock interceptors
      let hookFired = false;
      client.addRequestInterceptor((url, opts) => {
        hookFired = true;
        return { url, options: opts };
      });

      // Mock fetch handler dynamically
      const originalFetch = globalThis.fetch;
      globalThis.fetch = async () => {
        return {
          ok: true,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({ status: 'success' })
        };
      };

      try {
        const data = await client.get('http://mock-api.local/v1');
        expect(data.status).toBe('success');
        expect(hookFired).toBe(true);

        // Fail mock fetch to trigger circuit breaker
        globalThis.fetch = async () => {
          throw new Error('Network error');
        };

        // Attempt 1: failure (bypass cache)
        try { await client.get('http://mock-api.local/v1', { retries: 0, cacheTtl: 0 }); } catch {}
        // Attempt 2: failure -> trips circuit (bypass cache)
        try { await client.get('http://mock-api.local/v1', { retries: 0, cacheTtl: 0 }); } catch {}

        expect(client.cbState).toBe('OPEN');

        // Verify request fast-fails without executing fetch
        let fetchAttempted = false;
        globalThis.fetch = async () => {
          fetchAttempted = true;
          return { ok: true, json: async () => ({}) };
        };

        try {
          await client.get('http://mock-api.local/v1');
          throw new Error('Should have failed due to open circuit');
        } catch (err) {
          expect(err.message.includes('CircuitBreakerError')).toBe(true);
          expect(fetchAttempted).toBe(false);
        }
      } finally {
        globalThis.fetch = originalFetch;
      }
    });
  });
