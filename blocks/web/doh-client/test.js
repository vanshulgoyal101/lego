import { describe, it, expect } from '../../../test/test-harness.js';
import { DohClient } from './index.js';

await describe('web/doh-client', async () => {
  await it('should execute DoH queries and parse mock responses', async () => {
    // Inject mock global fetch if not present in testing environments
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async (url) => {
      expect(url.includes('example.com')).toBe(true);
      expect(url.includes('type=A')).toBe(true);
      return {
        ok: true,
        status: 200,
        json: async () => ({
          Status: 0,
          Answer: [
            { name: 'example.com', type: 1, TTL: 3600, data: '93.184.216.34' }
          ]
        })
      };
    };

    try {
      const client = new DohClient();
      const answers = await client.resolve('example.com', 'A');
      expect(answers.length).toBe(1);
      expect(answers[0].data).toBe('93.184.216.34');
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  await it('should handle error status response failures', async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async () => ({
      ok: true,
      status: 200,
      json: async () => ({ Status: 2, Comment: 'Server Failure' })
    });

    try {
      const client = new DohClient();
      await expect(async () => {
        await client.resolve('error.com');
      }).toThrowAsync('DNS server returned error status code');
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});
