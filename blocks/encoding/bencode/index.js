/**
 * BitTorrent Bencode encoder and decoder.
 *
 * Bencode is the serialization format used in BitTorrent .torrent files and
 * DHT protocol messages. It supports four data types:
 *
 *  - Byte strings  – "<length>:<bytes>"  e.g. "4:spam"
 *  - Integers      – "i<n>e"             e.g. "i42e", "i-3e"
 *  - Lists         – "l<items>e"         e.g. "l4:spami42ee"
 *  - Dictionaries  – "d<k-v pairs>e"     e.g. "d3:cow3:mooe" (keys lexicographically sorted)
 */

/**
 * Encodes a JavaScript value into a bencode string.
 *
 * Supported types:
 *  - string  → byte string
 *  - number  → integer (must be a safe integer)
 *  - Array   → list
 *  - Object  → dictionary (keys sorted lexicographically as per the spec)
 *
 * @param {string | number | Array | Object} data - The value to encode.
 * @returns {string} The bencode-encoded string.
 * @throws {TypeError} If an unsupported type is provided or a number is not a safe integer.
 *
 * @example
 * encode("spam");             // "4:spam"
 * encode(42);                 // "i42e"
 * encode(["a", 1]);           // "l1:ai1ee"
 * encode({ cow: "moo" });     // "d3:cow3:mooe"
 */
export function encode(data) {
  if (typeof data === 'string') {
    // UTF-8 byte length (spec requires byte length, not character length)
    const byteLen = new TextEncoder().encode(data).length;
    return `${byteLen}:${data}`;
  }

  if (typeof data === 'number') {
    if (!Number.isInteger(data)) {
      throw new TypeError('encode: only integer numbers are supported in bencode');
    }
    return `i${data}e`;
  }

  if (Array.isArray(data)) {
    return `l${data.map(encode).join('')}e`;
  }

  if (data !== null && typeof data === 'object') {
    // Keys MUST be sorted lexicographically
    const sorted = Object.keys(data).sort();
    const pairs = sorted.map(key => `${encode(key)}${encode(data[key])}`).join('');
    return `d${pairs}e`;
  }

  throw new TypeError(`encode: unsupported type "${typeof data}" (value: ${data})`);
}

/**
 * Decodes a bencode string or Uint8Array back into a JavaScript value.
 *
 * @param {string | Uint8Array} buffer - The bencode data to decode.
 * @returns {string | number | Array | Object} The decoded JavaScript value.
 * @throws {TypeError}  If buffer is not a string or Uint8Array.
 * @throws {Error}      If the bencode data is malformed.
 *
 * @example
 * decode("4:spam");             // "spam"
 * decode("i42e");               // 42
 * decode("l4:spami42ee");       // ["spam", 42]
 * decode("d3:cow3:mooe");       // { cow: "moo" }
 */
export function decode(buffer) {
  let str;
  if (buffer instanceof Uint8Array) {
    str = new TextDecoder().decode(buffer);
  } else if (typeof buffer === 'string') {
    str = buffer;
  } else {
    throw new TypeError('decode: buffer must be a string or Uint8Array');
  }

  const { value, offset } = decodeValue(str, 0);
  if (offset !== str.length) {
    throw new Error(`decode: trailing data after bencode value at offset ${offset}`);
  }
  return value;
}

/**
 * Internal recursive decoder. Returns the decoded value and the new offset.
 *
 * @param {string} str    - Full bencode string.
 * @param {number} offset - Current reading position.
 * @returns {{ value: *, offset: number }}
 */
function decodeValue(str, offset) {
  const ch = str[offset];

  if (ch === 'i') {
    // Integer: i<digits>e
    const end = str.indexOf('e', offset + 1);
    if (end === -1) throw new Error('decode: unterminated integer');
    const numStr = str.slice(offset + 1, end);
    const value = parseInt(numStr, 10);
    if (isNaN(value)) throw new Error(`decode: invalid integer "${numStr}"`);
    // Guard against leading zeros (e.g. "i03e" is invalid per spec)
    if (numStr !== '0' && numStr !== `-${Math.abs(value)}` && numStr !== String(value)) {
      throw new Error(`decode: invalid integer encoding "${numStr}"`);
    }
    return { value, offset: end + 1 };
  }

  if (ch === 'l') {
    // List: l<items>e
    const list = [];
    offset += 1;
    while (str[offset] !== 'e') {
      if (offset >= str.length) throw new Error('decode: unterminated list');
      const result = decodeValue(str, offset);
      list.push(result.value);
      offset = result.offset;
    }
    return { value: list, offset: offset + 1 };
  }

  if (ch === 'd') {
    // Dictionary: d<key><value>...e
    const dict = {};
    offset += 1;
    while (str[offset] !== 'e') {
      if (offset >= str.length) throw new Error('decode: unterminated dictionary');
      const keyResult = decodeValue(str, offset);
      if (typeof keyResult.value !== 'string') {
        throw new Error('decode: dictionary keys must be strings');
      }
      offset = keyResult.offset;
      const valResult = decodeValue(str, offset);
      dict[keyResult.value] = valResult.value;
      offset = valResult.offset;
    }
    return { value: dict, offset: offset + 1 };
  }

  if (ch >= '0' && ch <= '9') {
    // Byte string: <length>:<bytes>
    const colon = str.indexOf(':', offset);
    if (colon === -1) throw new Error('decode: missing colon in byte string');
    const length = parseInt(str.slice(offset, colon), 10);
    if (isNaN(length) || length < 0) throw new Error('decode: invalid byte string length');
    const value = str.slice(colon + 1, colon + 1 + length);
    if (value.length !== length) throw new Error('decode: byte string truncated');
    return { value, offset: colon + 1 + length };
  }

  throw new Error(`decode: unexpected character "${ch}" at offset ${offset}`);
}
