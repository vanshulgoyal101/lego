/**
 * Encode a non-negative integer (number or BigInt) to varint bytes
 *
 * @param {number|BigInt} value
 * @returns {Uint8Array} Varint encoded bytes
 */
export function encode(value) {
  let val = BigInt(value);
  if (val < 0n) {
    throw new Error('RangeError: Varints must be non-negative.');
  }

  const bytes = [];
  while (val >= 0x80n) {
    bytes.push(Number((val & 0x7Fn) | 0x80n));
    val = val >> 7n;
  }
  bytes.push(Number(val));
  return new Uint8Array(bytes);
}

/**
 * Decode varint bytes back to a BigInt
 *
 * @param {Uint8Array|Buffer|number[]} bytes - Array of bytes containing the varint
 * @param {number} [offset=0] - Offset to start reading from
 * @returns {{value: BigInt, bytesRead: number}} Reconstructed BigInt and total bytes consumed
 */
export function decode(bytes, offset = 0) {
  let value = 0n;
  let shift = 0n;
  let bytesRead = 0;

  while (offset + bytesRead < bytes.length) {
    const byte = bytes[offset + bytesRead];
    value |= BigInt(byte & 0x7F) << shift;
    bytesRead++;
    if ((byte & 0x80) === 0) {
      return { value, bytesRead };
    }
    shift += 7n;
  }

  throw new Error('UnexpectedEOF: Incomplete varint stream.');
}
