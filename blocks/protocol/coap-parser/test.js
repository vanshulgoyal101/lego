import { describe, it, expect } from '../../../test/test-harness.js';
import { serialize, deserialize } from './index.js';

await describe('protocol/coap-parser', async () => {
  await it('should serialize and deserialize a basic CoAP message correctly', () => {
    const originalMessage = {
      version: 1,
      type: 0, // CON
      token: Buffer.from([0xAA, 0xBB]),
      code: '0.01', // GET
      messageId: 0x1234,
      options: [
        { name: 'uri-path', value: 'temperature' },
        { name: 'uri-query', value: 'unit=c' }
      ],
      payload: 'sensor reading'
    };

    const buf = serialize(originalMessage);
    expect(buf instanceof Buffer).toBe(true);

    const result = deserialize(buf);
    expect(result !== null).toBe(true);
    expect(result.bytesRead).toBe(buf.length);

    const msg = result.message;
    expect(msg.version).toBe(1);
    expect(msg.type).toBe(0);
    expect(Buffer.compare(msg.token, Buffer.from([0xAA, 0xBB]))).toBe(0);
    expect(msg.code).toBe(1); // GET code is 1
    expect(msg.codeString).toBe('0.01');
    expect(msg.messageId).toBe(0x1234);

    expect(msg.options.length).toBe(2);
    expect(msg.options[0].name).toBe('uri-path');
    expect(msg.options[0].value).toBe('temperature');
    expect(msg.options[1].name).toBe('uri-query');
    expect(msg.options[1].value).toBe('unit=c');

    expect(msg.payload.toString('utf8')).toBe('sensor reading');
  });

  await it('should handle code numbers and code strings correctly', () => {
    const msg1 = {
      code: '2.05', // Content (2 * 32 + 5 = 69)
      messageId: 1
    };
    const buf1 = serialize(msg1);
    const res1 = deserialize(buf1);
    expect(res1.message.code).toBe(69);
    expect(res1.message.codeString).toBe('2.05');
  });

  await it('should encode option delta extensions correctly for large option numbers', () => {
    const originalMessage = {
      code: 1,
      messageId: 2,
      options: [
        { name: 50, value: 'test50' }, // Custom Option number 50
        { name: 'size1', value: 1024 } // Option number 60
      ]
    };

    const buf = serialize(originalMessage);
    const result = deserialize(buf);
    expect(result !== null).toBe(true);

    const msg = result.message;
    expect(msg.options.length).toBe(2);
    expect(msg.options[0].name).toBe(50);
    expect(msg.options[0].value.toString('utf8')).toBe('test50');
    expect(msg.options[1].name).toBe('size1');
    expect(msg.options[1].value).toBe(1024);
  });

  await it('should return null for incomplete CoAP packets', () => {
    const originalMessage = {
      code: 1,
      messageId: 3,
      payload: 'hello payload'
    };

    const buf = serialize(originalMessage);
    const incompleteBuf = buf.subarray(0, 3); // Truncated header
    const result = deserialize(incompleteBuf);
    expect(result).toBe(null);
  });
});
