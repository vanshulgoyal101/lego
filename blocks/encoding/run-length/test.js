import { describe, it, expect } from '../../../test/test-harness.js';
import { encode, decode, encodeString, decodeString } from './index.js';

await describe('encoding/run-length', async () => {

  await it('encode produces correct RLE pairs for strings', () => {
    const result = encode('aaabbc');
    expect(result).toEqual([[3, 'a'], [2, 'b'], [1, 'c']]);
  });

  await it('encode works for arrays', () => {
    const result = encode([1, 1, 2, 3, 3]);
    expect(result).toEqual([[2, 1], [1, 2], [2, 3]]);
  });

  await it('encode handles empty string', () => {
    expect(encode('')).toEqual([]);
  });

  await it('encode handles empty array', () => {
    expect(encode([])).toEqual([]);
  });

  await it('encode handles single element', () => {
    expect(encode('a')).toEqual([[1, 'a']]);
    expect(encode([42])).toEqual([[1, 42]]);
  });

  await it('encode handles no repeated elements', () => {
    expect(encode('abc')).toEqual([[1, 'a'], [1, 'b'], [1, 'c']]);
  });

  await it('encode throws for invalid input', () => {
    expect(() => encode(123)).toThrow('string or an array');
  });

  await it('decode reconstructs string from RLE pairs', () => {
    const decoded = decode([[3, 'a'], [2, 'b'], [1, 'c']]);
    expect(decoded).toBe('aaabbc');
  });

  await it('decode reconstructs array from RLE pairs with non-string values', () => {
    const decoded = decode([[2, 1], [1, 2], [2, 3]]);
    expect(decoded).toEqual([1, 1, 2, 3, 3]);
  });

  await it('decode handles empty array', () => {
    expect(decode([])).toEqual([]);
  });

  await it('decode throws for invalid count', () => {
    expect(() => decode([[0, 'a']])).toThrow('positive integer');
  });

  await it('encode/decode string roundtrip', () => {
    const inputs = ['aaabbbccc', 'abc', 'aaaa', 'a', 'aabbcc'];
    for (const str of inputs) {
      expect(decode(encode(str))).toBe(str);
    }
  });

  await it('encode/decode array roundtrip', () => {
    const arr = [true, true, false, false, false, true];
    expect(decode(encode(arr))).toEqual(arr);
  });

  await it('encodeString produces compact representation', () => {
    expect(encodeString('aaabbc')).toBe('3a2b1c');
    expect(encodeString('abc')).toBe('1a1b1c');
    expect(encodeString('')).toBe('');
  });

  await it('decodeString reconstructs original string', () => {
    expect(decodeString('3a2b1c')).toBe('aaabbc');
    expect(decodeString('1a1b1c')).toBe('abc');
    expect(decodeString('')).toBe('');
  });

  await it('encodeString/decodeString roundtrip', () => {
    const inputs = ['hello', 'aaabbbccc', 'xxxyyyzzz', 'a'];
    for (const str of inputs) {
      expect(decodeString(encodeString(str))).toBe(str);
    }
  });

  await it('encodeString throws for non-string', () => {
    expect(() => encodeString(42)).toThrow('string');
  });
});
