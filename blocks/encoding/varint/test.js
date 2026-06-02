import { describe, it, expect } from '../../../test/test-harness.js';
import { encode, decode } from './index.js';

await describe('encoding/varint', async () => {
  await it('should encode and decode values up to very large BigInts', () => {
    // 150 should be encoded as [0x96, 0x01]
    const b150 = encode(150);
    expect(b150.length).toBe(2);
    expect(b150[0]).toBe(0x96);
    expect(b150[1]).toBe(0x01);

    const d150 = decode(b150);
    expect(d150.value).toBe(150n);
    expect(d150.bytesRead).toBe(2);

    // Large BigInt
    const val = 12345678901234567890n;
    const bLarge = encode(val);
    const dLarge = decode(bLarge);
    expect(dLarge.value).toBe(val);

    // 0 and 1
    expect(decode(encode(0)).value).toBe(0n);
    expect(decode(encode(1)).value).toBe(1n);
  });

  await it('should decode multiple consecutive varints using offsets', () => {
    const b1 = encode(300); // 2 bytes
    const b2 = encode(12);  // 1 byte
    const stream = new Uint8Array(b1.length + b2.length);
    stream.set(b1, 0);
    stream.set(b2, b1.length);

    const r1 = decode(stream, 0);
    expect(r1.value).toBe(300n);
    expect(r1.bytesRead).toBe(2);

    const r2 = decode(stream, r1.bytesRead);
    expect(r2.value).toBe(12n);
    expect(r2.bytesRead).toBe(1);
  });
});
