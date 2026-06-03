import { describe, it, expect } from '../../../test/test-harness.js';
import { validate, handlePreflight } from './index.js';

await describe('validation/cors', async () => {
  await it('should validate and set origin headers when matching wildcard', () => {
    const origin = 'https://example.com';
    const result = validate(origin, { allowedOrigins: '*' });
    expect(result.isAllowed).toBe(true);
    expect(result.headers['Access-Control-Allow-Origin']).toBe('*');
  });

  await it('should support credentials by returning matching origin instead of wildcard', () => {
    const origin = 'https://example.com';
    const result = validate(origin, { allowedOrigins: '*', allowCredentials: true });
    expect(result.isAllowed).toBe(true);
    expect(result.headers['Access-Control-Allow-Origin']).toBe(origin);
    expect(result.headers['Access-Control-Allow-Credentials']).toBe('true');
  });

  await it('should allow origins matching subdomain wildcards', () => {
    const policy = { allowedOrigins: ['*.example.com'] };
    expect(validate('https://api.example.com', policy).isAllowed).toBe(true);
    expect(validate('https://nested.sub.example.com', policy).isAllowed).toBe(true);
    expect(validate('https://evil.com', policy).isAllowed).toBe(false);
  });

  await it('should approve preflight requests matching allowed methods and headers', () => {
    const origin = 'https://example.com';
    const policy = {
      allowedOrigins: ['https://example.com'],
      allowedMethods: ['POST', 'GET'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      maxAge: 86400
    };

    const preflight = handlePreflight(origin, 'POST', 'content-type, authorization', policy);
    expect(preflight.isAllowed).toBe(true);
    expect(preflight.headers['Access-Control-Allow-Origin']).toBe(origin);
    expect(preflight.headers['Access-Control-Allow-Methods']).toBe('POST, GET');
    expect(preflight.headers['Access-Control-Max-Age']).toBe('86400');
  });

  await it('should reject preflight requests with unauthorized methods or headers', () => {
    const origin = 'https://example.com';
    const policy = {
      allowedOrigins: ['https://example.com'],
      allowedMethods: ['GET'],
      allowedHeaders: ['Content-Type']
    };

    // Method not allowed
    const badMethod = handlePreflight(origin, 'DELETE', 'content-type', policy);
    expect(badMethod.isAllowed).toBe(false);

    // Header not allowed
    const badHeader = handlePreflight(origin, 'GET', 'x-custom-header', policy);
    expect(badHeader.isAllowed).toBe(false);
  });
});
