import { describe, it, expect } from '../../../test/test-harness.js';
import {
  encodeVarint, decodeVarint,
  encodeSignedVarint, decodeSignedVarint,
} from './index.js';

await describe('encoding/varint', async () => {

  await it('encodeVarint encodes small values in one byte', () => {
    const buf = encodeVarint(1);
    expect(buf.length).toBe(1);
    expect(buf[0]).toBe(0x01);

    const buf127 = encodeVarint(127);
    expect(buf127.length).toBe(1);
    expect(buf127[0]).toBe(0x7f);
  });

  await it('encodeVarint encodes 128 in two bytes', () => {
    const buf = encodeVarint(128);
    expect(buf.length).toBe(2);
    expect(buf[0]).toBe(0x80);
    expect(buf[1]).toBe(0x01);
  });

  await it('encodeVarint encodes 300 correctly', () => {
    const buf = encodeVarint(300);
    expect(buf.length).toBe(2);
    expect(buf[0]).toBe(0xac);
    expect(buf[1]).toBe(0x02);
  });

  await it('encodeVarint encodes 0', () => {
    const buf = encodeVarint(0);
    expect(buf.length).toBe(1);
    expect(buf[0]).toBe(0x00);
  });

  await it('encodeVarint throws for negative numbers', () => {
    expect(() => encodeVarint(-1)).toThrow('non-negative');
  });

  await it('decodeVarint decodes single-byte values', () => {
    const { value, bytesRead } = decodeVarint(new Uint8Array([0x01]));
    expect(value).toBe(1);
    expect(bytesRead).toBe(1);
  });

  await it('decodeVarint decodes 300', () => {
    const { value, bytesRead } = decodeVarint(new Uint8Array([0xac, 0x02]));
    expect(value).toBe(300);
    expect(bytesRead).toBe(2);
  });

  await it('decodeVarint respects offset parameter', () => {
    // Prepend a zero byte; reading from offset 1 should still find the varint
    const buf = new Uint8Array([0x00, 0xac, 0x02]);
    const { value, bytesRead } = decodeVarint(buf, 1);
    expect(value).toBe(300);
    expect(bytesRead).toBe(2);
  });

  await it('encodeVarint/decodeVarint roundtrip for various values', () => {
    const testValues = [0, 1, 63, 64, 127, 128, 255, 300, 16383, 16384, 2097151];
    for (const n of testValues) {
      const encoded = encodeVarint(n);
      const { value } = decodeVarint(encoded);
      expect(value).toBe(n);
    }
  });

  await it('encodeSignedVarint encodes negative numbers efficiently', () => {
    const neg1 = encodeSignedVarint(-1);
    expect(neg1.length).toBe(1);
    expect(neg1[0]).toBe(0x01); // ZigZag(-1) = 1

    const neg2 = encodeSignedVarint(-2);
    expect(neg2[0]).toBe(0x03); // ZigZag(-2) = 3
  });

  await it('encodeSignedVarint encodes positive numbers', () => {
    const pos1 = encodeSignedVarint(1);
    expect(pos1[0]).toBe(0x02); // ZigZag(1) = 2
  });

  await it('decodeSignedVarint decodes negative numbers', () => {
    const { value } = decodeSignedVarint(new Uint8Array([0x01]));
    expect(value).toBe(-1);
  });

  await it('encodeSignedVarint/decodeSignedVarint roundtrip', () => {
    const testValues = [-1000, -128, -1, 0, 1, 128, 1000];
    for (const n of testValues) {
      const encoded = encodeSignedVarint(n);
      const { value } = decodeSignedVarint(encoded);
      expect(value).toBe(n);
    }
  });

  await it('decodeVarint throws on truncated buffer', () => {
    // A buffer where the MSB is set (continuation bit) but there are no more bytes
    expect(() => decodeVarint(new Uint8Array([0x80]))).toThrow();
  });
});
