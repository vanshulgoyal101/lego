/**
 * Encode a JS object structure to Bencoded Buffer
 *
 * @param {*} data - integer, string, Array, or Object
 * @returns {Buffer} Bencoded binary payload
 */
export function encode(data) {
  if (typeof data === 'number' && Number.isInteger(data)) {
    return Buffer.from(`i${data}e`);
  }
  if (typeof data === 'string') {
    const buf = Buffer.from(data, 'utf8');
    return Buffer.concat([Buffer.from(`${buf.length}:`), buf]);
  }
  if (Buffer.isBuffer(data)) {
    return Buffer.concat([Buffer.from(`${data.length}:`), data]);
  }
  if (Array.isArray(data)) {
    const bufs = [Buffer.from('l')];
    for (const item of data) {
      bufs.push(encode(item));
    }
    bufs.push(Buffer.from('e'));
    return Buffer.concat(bufs);
  }
  if (typeof data === 'object' && data !== null) {
    const keys = Object.keys(data).sort();
    const bufs = [Buffer.from('d')];
    for (const key of keys) {
      bufs.push(encode(key));
      bufs.push(encode(data[key]));
    }
    bufs.push(Buffer.from('e'));
    return Buffer.concat(bufs);
  }
  throw new Error('UnsupportedType: Cannot bencode the given data type.');
}

/**
 * Decode a Bencoded Buffer back to a JS data structure
 *
 * @param {Buffer|Uint8Array|string} buffer - Bencoded binary buffer or string
 * @returns {*} JS equivalent data structure
 */
export function decode(buffer) {
  const buf = Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer);
  let offset = 0;

  function parseNext() {
    if (offset >= buf.length) {
      throw new Error('UnexpectedEOF: Buffer ended prematurely.');
    }
    const type = String.fromCharCode(buf[offset]);
    if (type === 'i') {
      offset++; // Skip 'i'
      const end = buf.indexOf(101, offset); // 'e' is 101
      if (end === -1) throw new Error('InvalidBencodeInteger');
      const valStr = buf.toString('utf8', offset, end);
      offset = end + 1;
      return parseInt(valStr, 10);
    }
    if (type === 'l') {
      offset++; // Skip 'l'
      const list = [];
      while (offset < buf.length && buf[offset] !== 101) { // 'e'
        list.push(parseNext());
      }
      if (offset >= buf.length) throw new Error('UnterminatedList');
      offset++; // Skip 'e'
      return list;
    }
    if (type === 'd') {
      offset++; // Skip 'd'
      const obj = {};
      while (offset < buf.length && buf[offset] !== 101) { // 'e'
        const key = parseNext();
        if (typeof key !== 'string') {
          throw new Error('InvalidDictionaryKey: Bencode keys must be strings.');
        }
        const val = parseNext();
        obj[key] = val;
      }
      if (offset >= buf.length) throw new Error('UnterminatedDictionary');
      offset++; // Skip 'e'
      return obj;
    }
    // String parsing
    const colonIdx = buf.indexOf(58, offset); // ':' is 58
    if (colonIdx === -1) throw new Error('InvalidByteString');
    const len = parseInt(buf.toString('utf8', offset, colonIdx), 10);
    if (isNaN(len)) throw new Error('InvalidByteStringLength');
    offset = colonIdx + 1;
    const strData = buf.slice(offset, offset + len);
    offset += len;
    return strData.toString('utf8');
  }

  return parseNext();
}
export default { encode, decode };
