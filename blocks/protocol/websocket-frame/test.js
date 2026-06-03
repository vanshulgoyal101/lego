import { describe, it, expect } from '../../../test/test-harness.js';
import { serialize, deserialize } from './index.js';

await describe('protocol/websocket-frame', async () => {
  await it('should serialize and deserialize unmasked text frames correctly', () => {
    const originalFrame = {
      fin: true,
      rsv1: false,
      rsv2: false,
      rsv3: false,
      opcode: 1, // Text
      mask: false,
      payload: 'hello world'
    };

    const buf = serialize(originalFrame);
    expect(buf instanceof Buffer).toBe(true);

    const result = deserialize(buf);
    expect(result !== null).toBe(true);
    expect(result.bytesRead).toBe(buf.length);

    const frame = result.frame;
    expect(frame.fin).toBe(true);
    expect(frame.opcode).toBe(1);
    expect(frame.mask).toBe(false);
    expect(frame.payload.toString('utf8')).toBe('hello world');
  });

  await it('should serialize and deserialize masked binary frames correctly', () => {
    const originalFrame = {
      fin: true,
      rsv1: false,
      rsv2: false,
      rsv3: false,
      opcode: 2, // Binary
      mask: true,
      maskingKey: Buffer.from([0x12, 0x34, 0x56, 0x78]),
      payload: Buffer.from([1, 2, 3, 4, 5])
    };

    const buf = serialize(originalFrame);
    const result = deserialize(buf);
    expect(result !== null).toBe(true);

    const frame = result.frame;
    expect(frame.fin).toBe(true);
    expect(frame.opcode).toBe(2);
    expect(frame.mask).toBe(true);
    expect(Buffer.compare(frame.maskingKey, Buffer.from([0x12, 0x34, 0x56, 0x78]))).toBe(0);
    // The parser returns the UNMASKED payload
    expect(frame.payload[0]).toBe(1);
    expect(frame.payload[1]).toBe(2);
    expect(frame.payload[2]).toBe(3);
    expect(frame.payload[3]).toBe(4);
    expect(frame.payload[4]).toBe(5);
  });

  await it('should handle medium size payloads (126 <= length <= 65535)', () => {
    const payload = Buffer.alloc(300, 'A');
    const originalFrame = {
      fin: true,
      opcode: 2,
      mask: false,
      payload
    };

    const buf = serialize(originalFrame);
    expect(buf[1]).toBe(126); // length indicator is 126

    const result = deserialize(buf);
    expect(result !== null).toBe(true);
    expect(result.frame.payload.length).toBe(300);
    expect(result.frame.payload.toString('utf8')).toBe(payload.toString('utf8'));
  });

  await it('should handle large size payloads (length > 65535)', () => {
    const payload = Buffer.alloc(70000, 'B');
    const originalFrame = {
      fin: true,
      opcode: 2,
      mask: false,
      payload
    };

    const buf = serialize(originalFrame);
    expect(buf[1]).toBe(127); // length indicator is 127

    const result = deserialize(buf);
    expect(result !== null).toBe(true);
    expect(result.frame.payload.length).toBe(70000);
    expect(result.frame.payload[0]).toBe(0x42); // 'B'
  });

  await it('should return null for incomplete frames', () => {
    const originalFrame = {
      fin: true,
      opcode: 1,
      mask: false,
      payload: 'longer payload content'
    };

    const buf = serialize(originalFrame);
    // Truncate the buffer to simulate incomplete read
    const incompleteBuf = buf.subarray(0, buf.length - 5);
    const result = deserialize(incompleteBuf);
    expect(result).toBe(null);
  });
});
