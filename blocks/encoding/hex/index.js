/**
 * Hexadecimal encoding and decoding utilities.
 */

/**
 * Encodes a Uint8Array or string into a hexadecimal string.
 * @param {Uint8Array|string} data - Data to encode
 * @returns {string} Hexadecimal representation
 */
export function encode(data) {
  let bytes;
  if (typeof data === 'string') {
    bytes = new TextEncoder().encode(data);
  } else if (data instanceof Uint8Array) {
    bytes = data;
  } else {
    throw new Error('InvalidInput: Expected Uint8Array or string');
  }

  let hex = '';
  for (let i = 0; i < bytes.length; i++) {
    const val = bytes[i];
    hex += (val < 16 ? '0' : '') + val.toString(16);
  }
  return hex;
}

/**
 * Decodes a hexadecimal string into a Uint8Array.
 * @param {string} hexStr - Hexadecimal string to decode
 * @returns {Uint8Array} Decoded byte array
 */
export function decode(hexStr) {
  if (typeof hexStr !== 'string') {
    throw new Error('InvalidInput: Expected hexadecimal string');
  }
  // Remove spaces or other non-hex formatting helpers if any
  const cleanHex = hexStr.replace(/[^0-9a-fA-F]/g, '');
  if (cleanHex.length % 2 !== 0) {
    throw new Error('InvalidInput: Hexadecimal string must have an even length');
  }

  const length = cleanHex.length / 2;
  const bytes = new Uint8Array(length);
  for (let i = 0; i < length; i++) {
    const byteVal = parseInt(cleanHex.substring(i * 2, i * 2 + 2), 16);
    if (Number.isNaN(byteVal)) {
      throw new Error('InvalidInput: Failed to parse hex character');
    }
    bytes[i] = byteVal;
  }
  return bytes;
}

/**
 * Encodes a string directly to its hex representation.
 * @param {string} str - String to encode
 * @returns {string} Hex representation
 */
export function encodeString(str) {
  return encode(str);
}

/**
 * Decodes a hex string back to a UTF-8 string.
 * @param {string} hexStr - Hex string to decode
 * @returns {string} Decoded UTF-8 string
 */
export function decodeString(hexStr) {
  const bytes = decode(hexStr);
  return new TextDecoder().decode(bytes);
}

export default {
  encode,
  decode,
  encodeString,
  decodeString
};
