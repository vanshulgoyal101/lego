import { describe, it, expect } from '../../../test/test-harness.js';
import { serialize, deserialize, deserializeStream } from './index.js';

await describe('protocol/grpc-encoder', async () => {
  await it('should serialize and deserialize uncompressed gRPC frames correctly', () => {
    const payload = Buffer.from('hello grpc');
    const frame = serialize(payload, false);

    expect(frame instanceof Buffer).toBe(true);
    expect(frame.length).toBe(5 + payload.length);
    expect(frame.readUInt8(0)).toBe(0); // Compressed flag
    expect(frame.readUInt32BE(1)).toBe(payload.length);

    const result = deserialize(frame);
    expect(result !== null).toBe(true);
    expect(result.compressed).toBe(false);
    expect(result.bytesRead).toBe(5 + payload.length);
    expect(result.payload.toString('utf8')).toBe('hello grpc');
  });

  await it('should serialize and deserialize compressed gRPC frames correctly', () => {
    const payload = Buffer.from([1, 2, 3, 4]);
    const frame = serialize(payload, true);

    expect(frame.readUInt8(0)).toBe(1); // Compressed flag
    expect(frame.readUInt32BE(1)).toBe(4);

    const result = deserialize(frame);
    expect(result !== null).toBe(true);
    expect(result.compressed).toBe(true);
    expect(Buffer.compare(result.payload, payload)).toBe(0);
  });

  await it('should return null for incomplete gRPC frames', () => {
    const payload = Buffer.from('some large message body');
    const frame = serialize(payload, false);

    // Header only (5 bytes), but payload is missing
    const incompleteFrame = frame.subarray(0, 5);
    const result = deserialize(incompleteFrame);
    expect(result).toBe(null);
  });

  await it('should parse stream buffer containing multiple frames correctly', () => {
    const payload1 = Buffer.from('msg1');
    const payload2 = Buffer.from('msg2_longer');

    const frame1 = serialize(payload1, false);
    const frame2 = serialize(payload2, true);

    const streamBuffer = Buffer.concat([frame1, frame2, Buffer.from('partial_header_data')]);

    const { messages, remaining } = deserializeStream(streamBuffer);

    expect(messages.length).toBe(2);
    
    expect(messages[0].payload.toString('utf8')).toBe('msg1');
    expect(messages[0].compressed).toBe(false);

    expect(messages[1].payload.toString('utf8')).toBe('msg2_longer');
    expect(messages[1].compressed).toBe(true);

    expect(remaining.toString('utf8')).toBe('partial_header_data');
  });
});
