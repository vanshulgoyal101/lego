import { describe, it, expect } from '../../../test/test-harness.js';
import {
  toBinary, fromBinary,
  toHex, fromHex,
  toBigEndian, fromBigEndian,
  toLittleEndian, fromLittleEndian,
} from './index.js';

await describe('encoding/binary-codec', async () => {

  await it('toBinary encodes zero', () => {
    expect(toBinary(0)).toBe('0');
  });

  await it('toBinary encodes positive integers correctly', () => {
    expect(toBinary(10)).toBe('1010');
    expect(toBinary(255)).toBe('11111111');
    expect(toBinary(1)).toBe('1');
  });

  await it('toBinary throws for negative numbers', () => {
    expect(() => toBinary(-1)).toThrow('non-negative');
  });

  await it('fromBinary decodes binary strings back to numbers', () => {
    expect(fromBinary('1010')).toBe(10);
    expect(fromBinary('11111111')).toBe(255);
    expect(fromBinary('0')).toBe(0);
  });

  await it('fromBinary throws for invalid characters', () => {
    expect(() => fromBinary('102')).toThrow();
  });

  await it('toBinary/fromBinary roundtrip', () => {
    const values = [0, 1, 42, 128, 1000, 65535];
    for (const n of values) {
      expect(fromBinary(toBinary(n))).toBe(n);
    }
  });

  await it('toHex converts Uint8Array to hex string', () => {
    expect(toHex(new Uint8Array([0xde, 0xad, 0xbe, 0xef]))).toBe('deadbeef');
    expect(toHex(new Uint8Array([0, 255]))).toBe('00ff');
    expect(toHex(new Uint8Array([]))).toBe('');
  });

  await it('toHex throws for non-Uint8Array', () => {
    expect(() => toHex([1, 2])).toThrow('Uint8Array');
  });

  await it('fromHex parses hex strings to Uint8Array', () => {
    const buf = fromHex('deadbeef');
    expect(buf[0]).toBe(0xde);
    expect(buf[1]).toBe(0xad);
    expect(buf[2]).toBe(0xbe);
    expect(buf[3]).toBe(0xef);
  });

  await it('toHex/fromHex roundtrip', () => {
    const original = new Uint8Array([10, 20, 30, 40, 255, 0]);
    expect(toHex(fromHex(toHex(original)))).toBe(toHex(original));
  });

  await it('fromHex throws for odd-length string', () => {
    expect(() => fromHex('abc')).toThrow();
  });

  await it('toBigEndian encodes single-byte values', () => {
    const buf = toBigEndian(5, 1);
    expect(buf[0]).toBe(5);
  });

  await it('toBigEndian encodes multi-byte values correctly', () => {
    const buf = toBigEndian(256, 2);
    expect(buf[0]).toBe(0x01);
    expect(buf[1]).toBe(0x00);
  });

  await it('fromBigEndian decodes correctly', () => {
    expect(fromBigEndian(new Uint8Array([0x01, 0x00]))).toBe(256);
    expect(fromBigEndian(new Uint8Array([0x00, 0x01]))).toBe(1);
  });

  await it('toBigEndian/fromBigEndian roundtrip', () => {
    const values = [0, 1, 255, 256, 65535, 16777215];
    for (const n of values) {
      const bytes = Math.ceil(Math.log2(n + 2) / 8) || 1;
      expect(fromBigEndian(toBigEndian(n, bytes))).toBe(n);
    }
  });

  await it('toLittleEndian encodes least-significant byte first', () => {
    const buf = toLittleEndian(256, 2);
    expect(buf[0]).toBe(0x00);
    expect(buf[1]).toBe(0x01);
  });

  await it('fromLittleEndian decodes correctly', () => {
    expect(fromLittleEndian(new Uint8Array([0x00, 0x01]))).toBe(256);
    expect(fromLittleEndian(new Uint8Array([0xff, 0x00]))).toBe(255);
  });

  await it('toLittleEndian/fromLittleEndian roundtrip', () => {
    const values = [0, 1, 127, 128, 1000, 65535];
    for (const n of values) {
      const bytes = Math.ceil(Math.log2(n + 2) / 8) || 1;
      expect(fromLittleEndian(toLittleEndian(n, bytes))).toBe(n);
    }
  });

  await it('toBigEndian throws RangeError when value does not fit', () => {
    expect(() => toBigEndian(256, 1)).toThrow('does not fit');
  });
});
