import { describe, it, expect } from '../../../test/test-harness.js';
import { isValidUrl, isUrl, parseUrl } from './index.js';

await describe('validation/url-validator', async () => {
  await it('should accept standard https and http URLs', async () => {
    expect(isValidUrl('https://example.com').valid).toBe(true);
    expect(isValidUrl('http://example.com').valid).toBe(true);
    expect(isValidUrl('https://sub.domain.co.uk/path?q=1#hash').valid).toBe(true);
  });

  await it('should reject non-parseable strings', async () => {
    expect(isValidUrl('not a url').valid).toBe(false);
    expect(isValidUrl('').valid).toBe(false);
    expect(isValidUrl(42).valid).toBe(false);
  });

  await it('should enforce requireHttps option', async () => {
    expect(isValidUrl('http://example.com', { requireHttps: true }).valid).toBe(false);
    expect(isValidUrl('https://example.com', { requireHttps: true }).valid).toBe(true);
  });

  await it('should block localhost by default', async () => {
    expect(isValidUrl('http://localhost:3000').valid).toBe(false);
    expect(isValidUrl('http://127.0.0.1').valid).toBe(false);
  });

  await it('should allow localhost when allowLocalhost is true', async () => {
    expect(isValidUrl('http://localhost:3000', { allowLocalhost: true }).valid).toBe(true);
    expect(isValidUrl('http://127.0.0.1', { allowLocalhost: true }).valid).toBe(true);
  });

  await it('should enforce allowedProtocols option', async () => {
    const opts = { allowedProtocols: ['ftp', 'https'] };
    expect(isValidUrl('ftp://files.example.com', opts).valid).toBe(true);
    expect(isValidUrl('http://example.com', opts).valid).toBe(false);
    expect(isValidUrl('https://example.com', opts).valid).toBe(true);
  });

  await it('should require TLD by default', async () => {
    expect(isValidUrl('http://nodot').valid).toBe(false);
    expect(isValidUrl('http://example.com').valid).toBe(true);
  });

  await it('should skip TLD check when requireTLD is false', async () => {
    expect(isValidUrl('http://intranet', { requireTLD: false }).valid).toBe(true);
  });

  await it('isUrl should return boolean', async () => {
    expect(isUrl('https://example.com')).toBe(true);
    expect(isUrl('bad-url')).toBe(false);
  });

  await it('parseUrl should return structured components', async () => {
    const result = parseUrl('https://example.com:8080/path?q=1#sec');
    expect(result.protocol).toBe('https');
    expect(result.hostname).toBe('example.com');
    expect(result.port).toBe('8080');
    expect(result.pathname).toBe('/path');
    expect(result.search).toBe('?q=1');
    expect(result.hash).toBe('#sec');
  });

  await it('parseUrl should return null for invalid URL', async () => {
    expect(parseUrl('not-a-url')).toBe(null);
  });
});
