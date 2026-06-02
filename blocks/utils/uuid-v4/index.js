/**
 * UUID v4 Generator
 * Generates cryptographically-random RFC 4122 UUID v4 strings using Web Crypto API.
 * Works in Node.js >= 15, Deno, Bun, and all modern browsers.
 */

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const NANO_ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz_-';

/**
 * Generate a UUID v4 string.
 * @returns {string} A UUID v4 like 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
 */
export function uuidv4() {
  const bytes = new Uint8Array(16);
  (globalThis.crypto || globalThis.webcrypto).getRandomValues(bytes);

  // Set version (4) and variant (10xx) bits
  bytes[6] = (bytes[6] & 0x0f) | 0x40; // version 4
  bytes[8] = (bytes[8] & 0x3f) | 0x80; // variant 10

  const hex = Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20)}`;
}

/**
 * Validate a UUID string (any version).
 * @param {string} str - The string to validate.
 * @returns {boolean}
 */
export function isValidUuid(str) {
  return typeof str === 'string' && UUID_REGEX.test(str);
}

/**
 * Generate a short nano-ID style random string.
 * @param {number} [length=21] - Length of the output string.
 * @returns {string}
 */
export function nanoid(length = 21) {
  const bytes = new Uint8Array(length);
  (globalThis.crypto || globalThis.webcrypto).getRandomValues(bytes);
  return Array.from(bytes, b => NANO_ALPHABET[b % NANO_ALPHABET.length]).join('');
}

/**
 * Parse a UUID string into its component bytes.
 * @param {string} uuid - UUID string to parse.
 * @returns {Uint8Array} 16-byte array
 */
export function uuidToBytes(uuid) {
  if (!isValidUuid(uuid)) {
    throw new Error(`Invalid UUID: ${uuid}`);
  }
  const hex = uuid.replace(/-/g, '');
  const bytes = new Uint8Array(16);
  for (let i = 0; i < 16; i++) {
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

/**
 * Convert 16 bytes back to a UUID string.
 * @param {Uint8Array} bytes - 16-byte array.
 * @returns {string}
 */
export function bytesToUuid(bytes) {
  if (bytes.length !== 16) {
    throw new Error('bytesToUuid expects exactly 16 bytes');
  }
  const hex = Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20)}`;
}
