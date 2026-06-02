import { describe, it, expect } from '../../../test/test-harness.js';
import { isValidPhone, isE164, formatPhone, extractPhone } from './index.js';

await describe('validation/phone-validator', async () => {
  await it('should validate E.164 format', async () => {
    expect(isE164('+14155552671')).toBe(true);
    expect(isE164('+447911123456')).toBe(true);
    expect(isE164('14155552671')).toBe(false);  // no +
    expect(isE164('+1')).toBe(false);           // too short
  });

  await it('should validate a US number with country code', async () => {
    const result = isValidPhone('4155552671', 'US');
    expect(result.valid).toBe(true);
    expect(result.e164).toBe('+14155552671');
  });

  await it('should validate E.164 without country code', async () => {
    const result = isValidPhone('+14155552671');
    expect(result.valid).toBe(true);
    expect(result.e164).toBe('+14155552671');
  });

  await it('should reject empty input', async () => {
    expect(isValidPhone('').valid).toBe(false);
  });

  await it('should reject too-short numbers', async () => {
    expect(isValidPhone('123').valid).toBe(false);
  });

  await it('should accept numbers with spaces, dashes and parentheses', async () => {
    expect(isValidPhone('(415) 555-2671', 'US').valid).toBe(true);
    expect(isValidPhone('+1 (415) 555-2671').valid).toBe(true);
  });

  await it('should validate GB number', async () => {
    const result = isValidPhone('7911123456', 'GB');
    expect(result.valid).toBe(true);
    expect(result.e164).toBe('+447911123456');
  });

  await it('should reject US number with wrong length', async () => {
    const result = isValidPhone('415555267', 'US'); // 9 digits, needs 10
    expect(result.valid).toBe(false);
    expect(result.error).toBeTruthy();
  });

  await it('formatPhone should produce national format for US', async () => {
    const formatted = formatPhone('4155552671', 'US');
    expect(formatted).toBe('+1 (415) 555-2671');
  });

  await it('formatPhone should return E.164 when no country code', async () => {
    expect(formatPhone('+14155552671')).toBe('+14155552671');
  });

  await it('extractPhone should find phone numbers in text', async () => {
    const phones = extractPhone('Call us at +1-415-555-2671 or 0800123456 for info.');
    expect(phones.length).toBeGreaterThan(0);
    expect(phones.some(p => p.includes('415'))).toBe(true);
  });

  await it('extractPhone should return empty array for no matches', async () => {
    expect(extractPhone('No numbers here!')).toEqual([]);
  });
});
