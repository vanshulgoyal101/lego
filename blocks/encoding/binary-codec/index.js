/**
 * Binary data encoding/decoding utilities.
 *
 * Provides conversions between JavaScript numbers / Uint8Arrays and their
 * binary-string, hexadecimal, big-endian, and little-endian representations.
 * All functions are zero-dependency and work in both Node.js and browsers.
 */

/**
 * Converts a non-negative integer to its binary string representation.
 *
 * @param {number} n - A non-negative safe integer.
 * @returns {string} Binary string (e.g. 10 → "1010"). Returns "0" for 0.
 * @throws {TypeError} If n is not a non-negative integer.
 *
 * @example
 * toBinary(10);  // "1010"
 * toBinary(255); // "11111111"
 */
export function toBinary(n) {
  if (!Number.isInteger(n) || n < 0) {
    throw new TypeError('toBinary: n must be a non-negative integer');
  }
  if (n === 0) return '0';
  return n.toString(2);
}

/**
 * Parses a binary string back to a JavaScript number.
 *
 * @param {string} str - A string containing only '0' and '1' characters.
 * @returns {number} The decoded integer value.
 * @throws {TypeError} If str contains characters other than '0' and '1'.
 *
 * @example
 * fromBinary("1010"); // 10
 */
export function fromBinary(str) {
  if (!/^[01]+$/.test(str)) {
    throw new TypeError('fromBinary: str must contain only 0 and 1 characters');
  }
  return parseInt(str, 2);
}

/**
 * Converts a Uint8Array buffer to a lowercase hexadecimal string.
 *
 * @param {Uint8Array} buf - The byte buffer to convert.
 * @returns {string} Hex string with two characters per byte (e.g. Uint8Array([255,0]) → "ff00").
 * @throws {TypeError} If buf is not a Uint8Array.
 *
 * @example
 * toHex(new Uint8Array([0xde, 0xad, 0xbe, 0xef])); // "deadbeef"
 */
export function toHex(buf) {
  if (!(buf instanceof Uint8Array)) {
    throw new TypeError('toHex: buf must be a Uint8Array');
  }
  return Array.from(buf)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Parses a hexadecimal string back into a Uint8Array.
 *
 * @param {string} str - Even-length hex string (e.g. "deadbeef").
 * @returns {Uint8Array} The decoded byte buffer.
 * @throws {TypeError} If str is not a valid even-length hex string.
 *
 * @example
 * fromHex("deadbeef"); // Uint8Array([0xde, 0xad, 0xbe, 0xef])
 */
export function fromHex(str) {
  if (typeof str !== 'string' || str.length % 2 !== 0 || !/^[0-9a-fA-F]*$/.test(str)) {
    throw new TypeError('fromHex: str must be an even-length hexadecimal string');
  }
  const buf = new Uint8Array(str.length / 2);
  for (let i = 0; i < buf.length; i++) {
    buf[i] = parseInt(str.slice(i * 2, i * 2 + 2), 16);
  }
  return buf;
}

/**
 * Encodes a non-negative integer as a big-endian byte array.
 *
 * @param {number} n    - A non-negative integer to encode.
 * @param {number} byteCount - Number of bytes in the output buffer (1–6 safe).
 * @returns {Uint8Array} Big-endian encoded bytes.
 * @throws {TypeError} If arguments are invalid.
 * @throws {RangeError} If n does not fit in the requested number of bytes.
 *
 * @example
 * toBigEndian(256, 2); // Uint8Array([0x01, 0x00])
 */
export function toBigEndian(n, byteCount) {
  if (!Number.isInteger(n) || n < 0) {
    throw new TypeError('toBigEndian: n must be a non-negative integer');
  }
  if (!Number.isInteger(byteCount) || byteCount < 1) {
    throw new TypeError('toBigEndian: byteCount must be a positive integer');
  }
  const buf = new Uint8Array(byteCount);
  let remaining = n;
  for (let i = byteCount - 1; i >= 0; i--) {
    buf[i] = remaining & 0xff;
    remaining >>>= 8;
  }
  if (remaining !== 0) {
    throw new RangeError(`toBigEndian: value ${n} does not fit in ${byteCount} byte(s)`);
  }
  return buf;
}

/**
 * Decodes a big-endian Uint8Array into a JavaScript number.
 *
 * @param {Uint8Array} buf - Big-endian encoded byte buffer.
 * @returns {number} The decoded integer value.
 * @throws {TypeError} If buf is not a Uint8Array.
 *
 * @example
 * fromBigEndian(new Uint8Array([0x01, 0x00])); // 256
 */
export function fromBigEndian(buf) {
  if (!(buf instanceof Uint8Array)) {
    throw new TypeError('fromBigEndian: buf must be a Uint8Array');
  }
  let value = 0;
  for (let i = 0; i < buf.length; i++) {
    value = (value * 256) + buf[i];
  }
  return value;
}

/**
 * Encodes a non-negative integer as a little-endian byte array.
 *
 * @param {number} n    - A non-negative integer to encode.
 * @param {number} byteCount - Number of bytes in the output buffer.
 * @returns {Uint8Array} Little-endian encoded bytes (least-significant byte first).
 * @throws {TypeError} If arguments are invalid.
 * @throws {RangeError} If n does not fit in the requested number of bytes.
 *
 * @example
 * toLittleEndian(256, 2); // Uint8Array([0x00, 0x01])
 */
export function toLittleEndian(n, byteCount) {
  if (!Number.isInteger(n) || n < 0) {
    throw new TypeError('toLittleEndian: n must be a non-negative integer');
  }
  if (!Number.isInteger(byteCount) || byteCount < 1) {
    throw new TypeError('toLittleEndian: byteCount must be a positive integer');
  }
  const buf = new Uint8Array(byteCount);
  let remaining = n;
  for (let i = 0; i < byteCount; i++) {
    buf[i] = remaining & 0xff;
    remaining >>>= 8;
  }
  if (remaining !== 0) {
    throw new RangeError(`toLittleEndian: value ${n} does not fit in ${byteCount} byte(s)`);
  }
  return buf;
}

/**
 * Decodes a little-endian Uint8Array into a JavaScript number.
 *
 * @param {Uint8Array} buf - Little-endian encoded byte buffer.
 * @returns {number} The decoded integer value.
 * @throws {TypeError} If buf is not a Uint8Array.
 *
 * @example
 * fromLittleEndian(new Uint8Array([0x00, 0x01])); // 256
 */
export function fromLittleEndian(buf) {
  if (!(buf instanceof Uint8Array)) {
    throw new TypeError('fromLittleEndian: buf must be a Uint8Array');
  }
  let value = 0;
  let multiplier = 1;
  for (let i = 0; i < buf.length; i++) {
    value += buf[i] * multiplier;
    multiplier *= 256;
  }
  return value;
}
