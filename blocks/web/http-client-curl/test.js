import { describe, it, expect } from '../../../test/test-harness.js';
import { HttpClientCurl } from './index.js';

await describe('web/http-client-curl', async () => {
  await it('should generate a simple GET curl command', () => {
    const cmd = HttpClientCurl.toCurl('https://api.example.com/users');
    expect(cmd).toBe('curl "https://api.example.com/users"');
  });

  await it('should generate a POST command with headers and json body', () => {
    const cmd = HttpClientCurl.toCurl('https://api.example.com/users', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer token123'
      },
      body: { name: "Alice's Place" }
    });

    expect(cmd.includes('-X POST')).toBe(true);
    expect(cmd.includes('-H "Authorization: Bearer token123"')).toBe(true);
    expect(cmd.includes('-H "Content-Type: application/json"')).toBe(true);
    // Escaped single quote check: Alice's -> Alice'\''s
    expect(cmd.includes("-d '{\"name\":\"Alice'\\''s Place\"}'")).toBe(true);
  });
});
