/**
 * A UUID compression utility.
 * Shortens a standard 36-character UUID string (with dashes) into a URL-safe,
 * compact 22-character string using Base62 encoding, and decodes it back.
 * Useful for short URL builders, database primary key indexing, or network payload compression.
 */

const BASE62 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

/**
 * Compresses a standard 36-character UUID into a 22-character Base62 string.
 * @param {string} uuid - Input UUID v4 string.
 * @returns {string} URL-safe 22-character Base62 string.
 */
export function shortenUuid(uuid) {
  const cleanHex = uuid.replace(/-/g, '');
  if (cleanHex.length !== 32 || !/^[0-9a-fA-F]+$/.test(cleanHex)) {
    throw new Error('Invalid UUID format');
  }

  // Convert 128-bit hex to a BigInt
  let num = BigInt(`0x${cleanHex}`);
  let result = '';

  while (num > 0n) {
    const remainder = num % 62n;
    result = BASE62[Number(remainder)] + result;
    num = num / 62n;
  }

  // Pad to ensure consistent length of 22 characters
  return result.padStart(22, '0');
}

/**
 * Decompresses a 22-character Base62 string back into a standard UUID format.
 * @param {string} shortStr - Compressed Base62 string.
 * @returns {string} Standard formatted UUID (e.g. xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx).
 */
export function expandUuid(shortStr) {
  if (shortStr.length !== 22) {
    throw new Error('Invalid shortened string length');
  }

  let num = 0n;
  for (let i = 0; i < shortStr.length; i++) {
    const char = shortStr[i];
    const val = BASE62.indexOf(char);
    if (val === -1) {
      throw new Error(`Invalid character in short UUID: ${char}`);
    }
    num = num * 62n + BigInt(val);
  }

  // Convert back to 32-character hex string
  let hex = num.toString(16).padStart(32, '0');

  // Insert standard UUID hyphens: 8-4-4-4-12
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}
