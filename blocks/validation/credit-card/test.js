import { describe, it, expect } from '../../../test/test-harness.js';
import { validateCard, detectType, formatCard } from './index.js';

await describe('validation/credit-card', async () => {
  await it('should validate a real Visa test number', async () => {
    const result = validateCard('4111111111111111');
    expect(result.valid).toBe(true);
    expect(result.type).toBe('visa');
    expect(result.formatted).toBe('4111 1111 1111 1111');
  });

  await it('should validate a real Mastercard test number', async () => {
    const result = validateCard('5500005555555559');
    expect(result.valid).toBe(true);
    expect(result.type).toBe('mastercard');
  });

  await it('should validate a real Amex test number', async () => {
    const result = validateCard('378282246310005');
    expect(result.valid).toBe(true);
    expect(result.type).toBe('amex');
    expect(result.formatted).toBe('3782 822463 10005');
  });

  await it('should validate a real Discover test number', async () => {
    const result = validateCard('6011111111111117');
    expect(result.valid).toBe(true);
    expect(result.type).toBe('discover');
  });

  await it('should reject a number that fails Luhn check', async () => {
    const result = validateCard('4111111111111112');
    expect(result.valid).toBe(false);
    expect(typeof result.error).toBe('string');
  });

  await it('should strip spaces and dashes before validating', async () => {
    const result = validateCard('4111-1111-1111-1111');
    expect(result.valid).toBe(true);
    expect(result.type).toBe('visa');
  });

  await it('should reject unknown card types', async () => {
    const result = validateCard('1234567890123456');
    expect(result.valid).toBe(false);
    expect(result.type).toBe('unknown');
  });

  await it('should reject empty input', async () => {
    const result = validateCard('');
    expect(result.valid).toBe(false);
    expect(result.error).toBeTruthy();
  });

  await it('detectType should return correct types', async () => {
    expect(detectType('4111111111111111')).toBe('visa');
    expect(detectType('5500005555555559')).toBe('mastercard');
    expect(detectType('378282246310005')).toBe('amex');
    expect(detectType('6011111111111117')).toBe('discover');
    expect(detectType('9999999999999999')).toBe('unknown');
  });

  await it('formatCard should group digits correctly', async () => {
    expect(formatCard('4111111111111111')).toBe('4111 1111 1111 1111');
    expect(formatCard('378282246310005')).toBe('3782 822463 10005');
  });
});
