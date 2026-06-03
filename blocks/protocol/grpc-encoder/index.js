/**
 * gRPC length-prefixed framing serializer and deserializer.
 * Format: 1-byte compressed flag + 4-byte big-endian length + body.
 */

/**
 * Serializes a payload into a gRPC length-prefixed frame.
 * @param {Buffer|Uint8Array|string} payload - The message payload to serialize.
 * @param {boolean} [compressed=false] - Whether the payload is compressed.
 * @returns {Buffer}
 */
export function serialize(payload, compressed = false) {
  const body = typeof payload === 'string'
    ? Buffer.from(payload, 'utf8')
    : Buffer.from(payload || []);

  const header = Buffer.alloc(5);
  header.writeUInt8(compressed ? 1 : 0, 0);
  header.writeUInt32BE(body.length, 1);

  return Buffer.concat([header, body]);
}

/**
 * Deserializes a gRPC length-prefixed frame from a Buffer.
 * Returns null if the buffer does not contain a complete frame.
 * @param {Buffer} buffer
 * @returns {Object|null} { payload: Buffer, compressed: boolean, bytesRead: number } or null
 */
export function deserialize(buffer) {
  if (buffer.length < 5) {
    return null;
  }

  const compressed = buffer.readUInt8(0) === 1;
  const length = buffer.readUInt32BE(1);

  if (buffer.length < 5 + length) {
    return null;
  }

  const payload = buffer.subarray(5, 5 + length);

  return {
    payload: Buffer.from(payload), // Return copy to prevent memory leaks from shared buffer reference
    compressed,
    bytesRead: 5 + length
  };
}

/**
 * Parses all complete gRPC frames from a stream buffer.
 * Returns an array of parsed messages and the remaining unparsed buffer.
 * @param {Buffer} buffer
 * @returns {Object} { messages: Array<{payload: Buffer, compressed: boolean}>, remaining: Buffer }
 */
export function deserializeStream(buffer) {
  const messages = [];
  let offset = 0;

  while (offset < buffer.length) {
    const result = deserialize(buffer.subarray(offset));
    if (!result) {
      break;
    }
    messages.push({
      payload: result.payload,
      compressed: result.compressed
    });
    offset += result.bytesRead;
  }

  return {
    messages,
    remaining: buffer.subarray(offset)
  };
}
