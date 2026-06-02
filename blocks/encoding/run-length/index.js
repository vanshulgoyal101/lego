/**
 * Run-length encoding (RLE) for compressing repetitive sequences.
 *
 * RLE replaces consecutive repeated values with a [count, value] pair.
 * This is effective for data with long runs of identical values (e.g.,
 * monochrome image pixels, sparse arrays, repeated characters in text).
 *
 * Generic API works on both strings and arrays.
 * Text-specific helpers produce compact human-readable encoded strings.
 */

/**
 * Encodes an array or string using run-length encoding.
 * Each run is represented as a [count, element] pair in the output array.
 *
 * @param {string | Array<any>} data - The input data to encode. Strings are
 *   treated as sequences of characters.
 * @returns {Array<[number, any]>} An array of [count, value] pairs.
 * @throws {TypeError} If data is not a string or array.
 *
 * @example
 * encode("aaabbc");        // [[3,"a"],[2,"b"],[1,"c"]]
 * encode([1, 1, 2, 3, 3]); // [[2,1],[1,2],[2,3]]
 */
export function encode(data) {
  if (typeof data !== 'string' && !Array.isArray(data)) {
    throw new TypeError('encode: data must be a string or an array');
  }

  const items = typeof data === 'string' ? [...data] : data;
  if (items.length === 0) return [];

  const result = [];
  let count = 1;

  for (let i = 1; i <= items.length; i++) {
    if (i < items.length && items[i] === items[i - 1]) {
      count++;
    } else {
      result.push([count, items[i - 1]]);
      count = 1;
    }
  }

  return result;
}

/**
 * Decodes a run-length encoded array back to its original form.
 * Returns an array when the values are not all single characters,
 * otherwise returns a string.
 *
 * @param {Array<[number, any]>} encoded - Array of [count, value] pairs.
 * @returns {Array<any> | string} The reconstructed data.
 * @throws {TypeError}  If encoded is not an array.
 * @throws {TypeError}  If any pair does not have a positive integer count.
 *
 * @example
 * decode([[3,"a"],[2,"b"],[1,"c"]]); // "aaabbc"
 * decode([[2,1],[1,2],[2,3]]);        // [1,1,2,3,3]
 */
export function decode(encoded) {
  if (!Array.isArray(encoded)) {
    throw new TypeError('decode: encoded must be an array of [count, value] pairs');
  }

  if (encoded.length === 0) return [];

  const result = [];
  let allSingleChars = true;

  for (const pair of encoded) {
    if (!Array.isArray(pair) || pair.length < 2) {
      throw new TypeError('decode: each entry must be a [count, value] pair');
    }
    const [count, value] = pair;
    if (!Number.isInteger(count) || count < 1) {
      throw new TypeError(`decode: count must be a positive integer, got ${count}`);
    }
    for (let i = 0; i < count; i++) {
      result.push(value);
    }
    if (typeof value !== 'string' || value.length !== 1) {
      allSingleChars = false;
    }
  }

  return allSingleChars ? result.join('') : result;
}

/**
 * Encodes a string into a compact human-readable RLE string.
 * Format: each run is written as "<count><char>" (e.g., "3a2b1c").
 * Single-character runs may still include a "1" prefix for consistency.
 *
 * @param {string} str - The input string to encode.
 * @returns {string} Compact RLE string (e.g. "aaabbc" → "3a2b1c").
 * @throws {TypeError} If str is not a string.
 *
 * @example
 * encodeString("aaabbc"); // "3a2b1c"
 * encodeString("abc");    // "1a1b1c"
 */
export function encodeString(str) {
  if (typeof str !== 'string') {
    throw new TypeError('encodeString: str must be a string');
  }
  const pairs = encode(str);
  return pairs.map(([count, char]) => `${count}${char}`).join('');
}

/**
 * Decodes a compact RLE-encoded string back to the original string.
 * Expects the format produced by encodeString() — e.g., "3a2b1c" → "aaabbc".
 *
 * @param {string} encoded - RLE-encoded string in "<count><char>" format.
 * @returns {string} The reconstructed original string.
 * @throws {TypeError} If encoded is not a string.
 * @throws {Error}     If the format is invalid.
 *
 * @example
 * decodeString("3a2b1c"); // "aaabbc"
 */
export function decodeString(encoded) {
  if (typeof encoded !== 'string') {
    throw new TypeError('decodeString: encoded must be a string');
  }
  if (encoded.length === 0) return '';

  // Parse tokens: each token is one or more digits followed by exactly one char
  const tokens = encoded.match(/(\d+)(.)/g);
  if (!tokens) {
    throw new Error('decodeString: invalid RLE string format');
  }

  let result = '';
  for (const token of tokens) {
    const match = token.match(/^(\d+)(.)$/);
    if (!match) throw new Error(`decodeString: malformed token "${token}"`);
    const count = parseInt(match[1], 10);
    const char = match[2];
    result += char.repeat(count);
  }
  return result;
}
