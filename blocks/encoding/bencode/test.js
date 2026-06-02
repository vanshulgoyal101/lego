import { describe, it, expect } from '../../../test/test-harness.js';
import { encode, decode } from './index.js';

await describe('encoding/bencode', async () => {

  // ─── Encoding ─────────────────────────────────────────────────────────────

  await it('encode: encodes a string as length-prefixed byte string', () => {
    expect(encode('spam')).toBe('4:spam');
    expect(encode('')).toBe('0:');
    expect(encode('hello')).toBe('5:hello');
  });

  await it('encode: encodes a positive integer', () => {
    expect(encode(42)).toBe('i42e');
    expect(encode(0)).toBe('i0e');
  });

  await it('encode: encodes a negative integer', () => {
    expect(encode(-3)).toBe('i-3e');
  });

  await it('encode: encodes an array (list)', () => {
    expect(encode(['spam', 42])).toBe('l4:spami42ee');
    expect(encode([])).toBe('le');
  });

  await it('encode: encodes a nested list', () => {
    expect(encode([[1, 2], [3]])).toBe('lli1ei2eeli3eee');
  });

  await it('encode: encodes a dictionary with sorted keys', () => {
    expect(encode({ cow: 'moo', spam: 'eggs' })).toBe('d3:cow3:moo4:spam4:eggse');
  });

  await it('encode: sorts dictionary keys lexicographically', () => {
    const result = encode({ z: 1, a: 2 });
    expect(result).toBe('d1:ai2e1:zi1ee');
  });

  await it('encode: throws for floating-point numbers', () => {
    expect(() => encode(1.5)).toThrow();
  });

  await it('encode: throws for unsupported types (null)', () => {
    expect(() => encode(null)).toThrow('unsupported type');
  });

  // ─── Decoding ─────────────────────────────────────────────────────────────

  await it('decode: decodes a byte string', () => {
    expect(decode('4:spam')).toBe('spam');
    expect(decode('0:')).toBe('');
  });

  await it('decode: decodes a positive integer', () => {
    expect(decode('i42e')).toBe(42);
    expect(decode('i0e')).toBe(0);
  });

  await it('decode: decodes a negative integer', () => {
    expect(decode('i-3e')).toBe(-3);
  });

  await it('decode: decodes a list', () => {
    expect(decode('l4:spami42ee')).toEqual(['spam', 42]);
    expect(decode('le')).toEqual([]);
  });

  await it('decode: decodes a nested dictionary', () => {
    expect(decode('d3:cow3:moo4:spam4:eggse')).toEqual({ cow: 'moo', spam: 'eggs' });
  });

  await it('decode: decodes nested structures', () => {
    const encoded = encode({ files: ['a.txt', 'b.txt'], count: 2 });
    expect(decode(encoded)).toEqual({ count: 2, files: ['a.txt', 'b.txt'] });
  });

  await it('decode: accepts a Uint8Array input', () => {
    const buf = new TextEncoder().encode('4:spam');
    expect(decode(buf)).toBe('spam');
  });

  await it('decode: throws on malformed input', () => {
    expect(() => decode('zzz')).toThrow();
  });

  // ─── Roundtrip ────────────────────────────────────────────────────────────

  await it('encode/decode roundtrip for complex structures', () => {
    const original = {
      announce: 'http://tracker.example.com',
      info: {
        length: 512000,
        name: 'example.iso',
        files: ['part1', 'part2'],
      },
    };
    expect(decode(encode(original))).toEqual(original);
  });
});
