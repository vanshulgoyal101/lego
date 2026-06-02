import { describe, it, expect } from '../../../test/test-harness.js';
import {validateEmail, isValidEmail, parseEmail} from './index.js';

  await describe('validation/email-rfc5322', async () => {
    await it('should accept standard valid emails', () => {
      expect(isValidEmail('user@example.com')).toBe(true);
      expect(isValidEmail('user.name+tag@subdomain.example.co.uk')).toBe(true);
      expect(isValidEmail('test123@domain.io')).toBe(true);
    });

    await it('should reject common invalid emails', () => {
      expect(isValidEmail('not-an-email')).toBe(false);
      expect(isValidEmail('@nodomain.com')).toBe(false);
      expect(isValidEmail('user@')).toBe(false);
      expect(isValidEmail('')).toBe(false);
    });

    await it('should reject emails with invalid domains', () => {
      expect(isValidEmail('user@.com')).toBe(false);
      expect(isValidEmail('user@domain.')).toBe(false);
      expect(isValidEmail('user@domain.c')).toBe(false); // TLD too short
    });

    await it('should reject emails with double dots in local part', () => {
      expect(isValidEmail('user..name@example.com')).toBe(false);
    });

    await it('should accept IP address literal domains', () => {
      expect(isValidEmail('user@[192.168.1.1]')).toBe(true);
    });

    await it('should parse email into parts', () => {
      const parsed = parseEmail('john.doe@example.com');
      expect(parsed.local).toBe('john.doe');
      expect(parsed.domain).toBe('example.com');
      expect(parsed.tld).toBe('com');
    });

    await it('should return validation errors with details', () => {
      const result = validateEmail('bademail');
      expect(result.valid).toBe(false);
      expect(typeof result.error).toBe('string');
    });
  });
