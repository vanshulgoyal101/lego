import { describe, it, expect } from '../../../test/test-harness.js';
import {fetchRetry} from './index.js';

  await describe('web/fetch-retry', async () => {
    await it('should return mock response successfully', async () => {
      const mockFetch = async () => ({ ok: true, status: 200, text: async () => 'OK' });
      globalThis.fetch = mockFetch;
      const res = await fetchRetry('https://example.com');
      expect(res.status).toBe(200);
    });

    await it('should retry on server failure', async () => {
      let count = 0;
      const mockFetch = async () => {
        count++;
        if (count < 3) {
          return { ok: false, status: 500 };
        }
        return { ok: true, status: 200 };
      };
      globalThis.fetch = mockFetch;
      let retryTriggered = 0;
      await fetchRetry('https://example.com', {
        retries: 3,
        delay: 5,
        onRetry: () => { retryTriggered++; }
      });
      expect(retryTriggered).toBe(2);
    });
  });
