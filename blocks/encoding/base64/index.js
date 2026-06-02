/**
 * A zero-dependency, self-contained Base64 encoder and decoder.
 * Works consistently in both Node.js and Browser environments.
 */

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
const LOOKUP = new Uint8Array(256);
for (let i = 0; i < CHARS.length; i++) {
  LOOKUP[CHARS.charCodeAt(i)] = i;
}

/**
 * Encodes a text string or byte array to Base64 format.
 * @param {string|Uint8Array} input
 * @returns {string} Base64 encoded string.
 */
export function encode(input) {
  let bytes;
  if (typeof input === 'string') {
    bytes = new TextEncoder().encode(input);
  } else if (input instanceof Uint8Array) {
    bytes = input;
  } else {
    throw new TypeError('Input must be a string or Uint8Array');
  }

  let result = '';
  const len = bytes.length;

  for (let i = 0; i < len; i += 3) {
    const b1 = bytes[i];
    const b2 = i + 1 < len ? bytes[i + 1] : 0;
    const b3 = i + 2 < len ? bytes[i + 2] : 0;

    const enc1 = b1 >> 2;
    const enc2 = ((b1 & 3) << 4) | (b2 >> 4);
    const enc3 = i + 1 < len ? (((b2 & 15) << 2) | (b3 >> 6)) : 64;
    const enc4 = i + 2 < len ? (b3 & 63) : 64;

    result += CHARS[enc1] + CHARS[enc2] + 
              (enc3 === 64 ? '=' : CHARS[enc3]) + 
              (enc4 === 64 ? '=' : CHARS[enc4]);
  }

  return result;
}

/**
 * Decodes a Base64 string back to a plain text string.
 * @param {string} base64Str
 * @returns {string} Plain text decoded output.
 */
export function decode(base64Str) {
  const bytes = decodeToBytes(base64Str);
  return new TextDecoder().decode(bytes);
}

/**
 * Decodes a Base64 string back to a Uint8Array byte array.
 * @param {string} base64Str
 * @returns {Uint8Array} Binary array output.
 */
export function decodeToBytes(base64Str) {
  const cleanStr = base64Str.replace(/[^A-Za-z0-9\+\/]/g, '');
  const len = cleanStr.length;
  
  let bufferLength = Math.floor(len * 0.75);
  if (base64Str[base64Str.length - 1] === '=') {
    bufferLength--;
    if (base64Str[base64Str.length - 2] === '=') {
      bufferLength--;
    }
  }

  const bytes = new Uint8Array(bufferLength);
  let p = 0;

  for (let i = 0; i < len; i += 4) {
    const enc1 = LOOKUP[cleanStr.charCodeAt(i)];
    const enc2 = LOOKUP[cleanStr.charCodeAt(i + 1)];
    const enc3 = i + 2 < len ? LOOKUP[cleanStr.charCodeAt(i + 2)] : 64;
    const enc4 = i + 3 < len ? LOOKUP[cleanStr.charCodeAt(i + 3)] : 64;

    const b1 = (enc1 << 2) | (enc2 >> 4);
    const b2 = ((enc2 & 15) << 4) | (enc3 >> 2);
    const b3 = ((enc3 & 3) << 6) | enc4;

    bytes[p++] = b1;
    if (enc3 !== 64 && p < bufferLength) {
      bytes[p++] = b2;
    }
    if (enc4 !== 64 && p < bufferLength) {
      bytes[p++] = b3;
    }
  }

  return bytes;
}
