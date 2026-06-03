import { describe, it, expect } from '../../../test/test-harness.js';
import { encode, decode, encodeString, decodeString } from './index.js';

await describe('encoding/hex', async () => {
  await it('should encode Uint8Array to hex correctly', () => {
    const bytes = new Uint8Array([0, 15, 255]);
    const hex = encode(bytes);
    expect(hex).toBe('000fff');
  });

  await it('should decode hex to Uint8Array correctly', () => {
    const hex = '000fff';
    const bytes = decode(hex);
    expect(bytes.length).toBe(3);
    expect(bytes[0]).toBe(0);
    expect(bytes[1]).toBe(15);
    expect(bytes[2]).toBe(255);
  });

  await it('should roundtrip encode and decode strings', () => {
    const original = 'Hello Hex! 🔥';
    const hex = encodeString(original);
    const decoded = decodeString(hex);
    expect(decoded).toBe(original);
  });

  await it('should handle empty input', () => {
    expect(encode(new Uint8Array([]))).toBe('');
    expect(decode('').length).toBe(0);
  });

  await it('should throw error on invalid odd-length hex strings', () => {
    let errorThrown = false;
    try {
      decode('abc');
    } catch (e) {
      errorThrown = true;
    }
    expect(errorThrown).toBe(true);
  });
});
