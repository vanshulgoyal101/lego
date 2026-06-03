import { describe, it, expect } from '../../../test/test-harness.js';
import { Utf8Validator } from './index.js';

await describe('encoding/utf8-validator', async () => {
  await it('should validate valid UTF-8 sequences', () => {
    // 1-byte ASCII
    expect(Utf8Validator.validate([0x41, 0x42, 0x43])).toBe(true);

    // 2-byte: "¢" (0xC2, 0xA2)
    expect(Utf8Validator.validate([0xC2, 0xA2])).toBe(true);

    // 3-byte: "€" (0xE2, 0x82, 0xAC)
    expect(Utf8Validator.validate([0xE2, 0x82, 0xAC])).toBe(true);

    // 4-byte: "𐍈" (0xF0, 0x90, 0x8D, 0x88)
    expect(Utf8Validator.validate([0xF0, 0x90, 0x8D, 0x88])).toBe(true);
  });

  await it('should reject invalid UTF-8 sequences', () => {
    // Invalid lead byte
    expect(Utf8Validator.validate([0xC0, 0xAF])).toBe(false);
    expect(Utf8Validator.validate([0xFF])).toBe(false);

    // Missing continuation bytes
    expect(Utf8Validator.validate([0xE2, 0x82])).toBe(false);

    // Invalid continuation byte
    expect(Utf8Validator.validate([0xE2, 0x82, 0x3F])).toBe(false);

    // Overlong encoding of ASCII
    expect(Utf8Validator.validate([0xE0, 0x80, 0xAF])).toBe(false);
  });
});
