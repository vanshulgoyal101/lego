import { describe, it, expect } from '../../../test/test-harness.js';
import { CSPBuilder } from './index.js';

describe('security/csp-builder', () => {
  it('should build a simple CSP string using fluent interface', () => {
    const builder = new CSPBuilder();
    builder
      .defaultSrc("'self'")
      .scriptSrc("'self'", 'https://apis.google.com')
      .styleSrc("'self'", "'unsafe-inline'");

    expect(builder.build()).toBe("default-src 'self'; script-src 'self' https://apis.google.com; style-src 'self' 'unsafe-inline'");
  });

  it('should append values to existing directives and remove duplicates', () => {
    const builder = new CSPBuilder();
    builder.defaultSrc("'self'");
    builder.defaultSrc("'self'", 'https://trusted.com');
    
    expect(builder.build()).toBe("default-src 'self' https://trusted.com");
  });

  it('should support adding nonces and hashes', () => {
    const builder = new CSPBuilder();
    builder.scriptSrc("'self'");
    builder.addNonce('script-src', 'rAnd0m123');
    builder.addHash('script-src', 'sha256', 'qznLcsRO158A=');

    expect(builder.build()).toBe("script-src 'self' 'nonce-rAnd0m123' 'sha256-qznLcsRO158A='");
  });

  it('should report warnings for weak policies during validation', () => {
    // 1. Weak script-src with * wildcard
    const weakCsp = new CSPBuilder()
      .scriptSrc('*')
      .objectSrc('*');

    const result = weakCsp.validate();
    expect(result.valid).toBe(false);
    expect(result.warnings.length).toBeGreaterThanOrEqual(2);
    expect(result.warnings.some(w => w.includes('default-src'))).toBe(true);
    expect(result.warnings.some(w => w.includes('script-src'))).toBe(true);

    // 2. Weak script-src with unsafe-inline and no nonces
    const weakInline = new CSPBuilder()
      .defaultSrc("'self'")
      .scriptSrc("'unsafe-inline'");
    const resInline = weakInline.validate();
    expect(resInline.valid).toBe(false);
    expect(resInline.warnings.some(w => w.includes('unsafe-inline'))).toBe(true);

    // 3. Clickjacking susceptibility
    const clickjacking = new CSPBuilder()
      .defaultSrc("'self'")
      .frameAncestors('*');
    const resClick = clickjacking.validate();
    expect(resClick.valid).toBe(false);
    expect(resClick.warnings.some(w => w.includes('frame-ancestors'))).toBe(true);
  });

  it('should return valid true for a strong policy', () => {
    const strongCsp = new CSPBuilder()
      .defaultSrc("'self'")
      .scriptSrc("'self'", "'nonce-supersecret'")
      .objectSrc("'none'");

    const result = strongCsp.validate();
    expect(result.valid).toBe(true);
    expect(result.warnings.length).toBe(0);
  });
});
