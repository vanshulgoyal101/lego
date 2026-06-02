import { describe, it, expect } from '../../../test/test-harness.js';
import { ApiClient } from './index.js';

await describe('web/api-client', async () => {
  await it('should trigger request and response interceptors', async () => {
    const client = new ApiClient({ baseURL: 'https://test.com' });
    let reqTriggered = false;
    let resTriggered = false;

    client.addRequestInterceptor((options) => {
      reqTriggered = true;
      options.headers['X-Custom'] = '1';
      return options;
    });

    client.addResponseInterceptor((response) => {
      resTriggered = true;
      return response;
    });

    const originalFetch = globalThis.fetch;
    globalThis.fetch = async (url, opts) => {
      expect(opts.headers['X-Custom']).toBe('1');
      return { ok: true, status: 200 };
    };

    try {
      await client.get('/items');
      expect(reqTriggered).toBe(true);
      expect(resTriggered).toBe(true);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});
