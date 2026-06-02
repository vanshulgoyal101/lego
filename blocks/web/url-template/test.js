import { describe, it, expect } from '../../../test/test-harness.js';
import { UrlTemplate } from './index.js';

await describe('web/url-template', async () => {
  await it('should expand simple templates correctly', () => {
    const t = new UrlTemplate('http://example.com/users/{id}');
    expect(t.expand({ id: '123' })).toBe('http://example.com/users/123');
  });

  await it('should handle path modifiers', () => {
    const t = new UrlTemplate('http://example.com/files{/path*}');
    expect(t.expand({ path: ['etc', 'hosts'] })).toBe('http://example.com/files/etc/hosts');
  });

  await it('should handle query variables', () => {
    const t = new UrlTemplate('http://example.com/search{?q,lang}');
    expect(t.expand({ q: 'lego blocks', lang: 'en' })).toBe('http://example.com/search?q=lego%20blocks&lang=en');
  });

  await it('should skip undefined template values', () => {
    const t = new UrlTemplate('http://example.com/search{?q,lang}');
    expect(t.expand({ q: 'test' })).toBe('http://example.com/search?q=test');
  });
});
