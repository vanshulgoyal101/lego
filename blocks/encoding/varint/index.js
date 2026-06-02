/**
 * Variable-length integer (varint) encoding and decoding.
 *
 * Implements protobuf-compatible Base-128 varint encoding where smaller values
 * occupy fewer bytes. The most significant bit (MSB) of each byte signals
 * whether more bytes follow. Also provides ZigZag encoding for efficient
 * signed integer representation.
 *
 * Unsigned varint byte costs:
 *  - 0–127        → 1 byte
 *  - 128–16383     → 2 bytes
 *  - 16384–2097151 → 3 bytes
 *  - etc.
 */

/**
 * Encodes a non-negative integer as a protobuf-style variable-length integer.
 *
 * @param {number} n - A non-negative integer (up to 2^53-1).
 * @returns {Uint8Array} The varint-encoded bytes.
 * @throws {TypeError} If n is negative or not a safe integer.
 *
 * @example
 * encodeVarint(300); // Uint8Array([0xAC, 0x02])
 * encodeVarint(1);   // Uint8Array([0x01])
 */
export function encodeVarint(n) {
  if (!Number.isInteger(n) || n < 0) {
    throw new TypeError('encodeVarint: n must be a non-negative integer');
  }
  const bytes = [];
  let value = n;
  do {
    let byte = value & 0x7f;
    value = Math.floor(value / 128); // avoid sign issues with >>>
    if (value > 0) byte |= 0x80;    // set continuation bit
    bytes.push(byte);
  } while (value > 0);
  return new Uint8Array(bytes);
}

/**
 * Decodes a protobuf-style varint from a byte buffer.
 *
 * @param {Uint8Array} buf    - Buffer containing the varint bytes.
 * @param {number}     [offset=0] - Byte offset to start reading from.
 * @returns {{ value: number, bytesRead: number }} Decoded value and how many bytes were consumed.
 * @throws {TypeError}  If buf is not a Uint8Array.
 * @throws {RangeError} If the varint overflows a safe integer or the buffer ends prematurely.
 *
 * @example
 * decodeVarint(new Uint8Array([0xAC, 0x02])); // { value: 300, bytesRead: 2 }
 */
export function decodeVarint(buf, offset = 0) {
  if (!(buf instanceof Uint8Array)) {
    throw new TypeError('decodeVarint: buf must be a Uint8Array');
  }
  let value = 0;
  let shift = 0;
  let bytesRead = 0;

  while (offset + bytesRead < buf.length) {
    const byte = buf[offset + bytesRead];
    bytesRead++;

    // Accumulate 7-bit chunks; use multiplication to avoid sign-extension issues
    value += (byte & 0x7f) * Math.pow(2, shift);
    shift += 7;

    if (!(byte & 0x80)) {
      // No continuation bit — we're done
      return { value, bytesRead };
    }

    if (shift > 49) {
      throw new RangeError('decodeVarint: value exceeds safe integer range');
    }
  }

  throw new RangeError('decodeVarint: buffer ended before varint was complete');
}

/**
 * ZigZag-encodes a signed integer to an unsigned integer.
 * Positive values map to even numbers, negative values to odd numbers.
 * This allows signed integers to be efficiently encoded as varints.
 *
 * @param {number} n - A signed integer.
 * @returns {number} ZigZag-encoded unsigned integer.
 *
 * @example
 * zigzagEncode(0);  // 0
 * zigzagEncode(-1); // 1
 * zigzagEncode(1);  // 2
 * zigzagEncode(-2); // 3
 */
function zigzagEncode(n) {
  return n >= 0 ? n * 2 : (-n) * 2 - 1;
}

/**
 * ZigZag-decodes an unsigned integer back to a signed integer.
 *
 * @param {number} n - ZigZag-encoded unsigned integer.
 * @returns {number} The original signed integer.
 *
 * @example
 * zigzagDecode(1); // -1
 * zigzagDecode(2); // 1
 */
function zigzagDecode(n) {
  return (n & 1) ? -(Math.floor(n / 2) + 1) : Math.floor(n / 2);
}

/**
 * Encodes a signed integer using ZigZag encoding followed by varint encoding.
 * This is the standard protobuf "sint32"/"sint64" encoding strategy.
 *
 * @param {number} n - Any signed integer.
 * @returns {Uint8Array} The encoded bytes.
 * @throws {TypeError} If n is not an integer.
 *
 * @example
 * encodeSignedVarint(-1); // Uint8Array([0x01])
 * encodeSignedVarint(1);  // Uint8Array([0x02])
 */
export function encodeSignedVarint(n) {
  if (!Number.isInteger(n)) {
    throw new TypeError('encodeSignedVarint: n must be an integer');
  }
  return encodeVarint(zigzagEncode(n));
}

/**
 * Decodes a ZigZag-encoded signed varint from a byte buffer.
 *
 * @param {Uint8Array} buf        - Buffer containing the encoded bytes.
 * @param {number}     [offset=0] - Byte offset to start reading from.
 * @returns {{ value: number, bytesRead: number }} Decoded signed value and bytes consumed.
 *
 * @example
 * decodeSignedVarint(new Uint8Array([0x01])); // { value: -1, bytesRead: 1 }
 */
export function decodeSignedVarint(buf, offset = 0) {
  const { value, bytesRead } = decodeVarint(buf, offset);
  return { value: zigzagDecode(value), bytesRead };
}
