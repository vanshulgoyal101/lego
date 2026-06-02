/**
 * Encode a JS data structure to Redis Serialization Protocol (RESP v2) string
 *
 * @param {*} data - Primitive value, Error, or nested Array
 * @returns {string} RESP formatted string
 */
export function encode(data) {
  if (data === null || data === undefined) {
    return '$-1\r\n';
  }
  if (typeof data === 'string') {
    return `$${Buffer.byteLength(data, 'utf8')}\r\n${data}\r\n`;
  }
  if (typeof data === 'number' && Number.isInteger(data)) {
    return `:${data}\r\n`;
  }
  if (data instanceof Error) {
    return `-${data.message}\r\n`;
  }
  if (Array.isArray(data)) {
    let result = `*${data.length}\r\n`;
    for (const item of data) {
      result += encode(item);
    }
    return result;
  }
  throw new Error('UnsupportedType: Cannot encode value to RESP.');
}

/**
 * RESP Stream Parser for parsing streaming Redis TCP packages
 */
export class RESPParser {
  constructor() {
    this.buffer = '';
  }

  /**
   * Parse a chunk of incoming data
   * @param {string} chunk - Incoming string chunk
   * @returns {Array} Array of successfully parsed complete RESP values
   */
  parse(chunk) {
    this.buffer += chunk;
    const results = [];

    while (this.buffer.length > 0) {
      const [val, bytesRead] = this._parseNext(this.buffer);
      if (bytesRead === 0) {
        break; // Incomplete package frame
      }
      results.push(val);
      this.buffer = this.buffer.slice(bytesRead);
    }

    return results;
  }

  _parseNext(buffer) {
    if (buffer.length === 0) return [null, 0];
    const type = buffer[0];
    const crlfIdx = buffer.indexOf('\r\n');
    if (crlfIdx === -1) return [null, 0];

    const line = buffer.slice(1, crlfIdx);

    switch (type) {
      case '+': // Simple String
        return [line, crlfIdx + 2];
      case '-': // Error
        return [new Error(line), crlfIdx + 2];
      case ':': // Integer
        return [parseInt(line, 10), crlfIdx + 2];
      case '$': { // Bulk String
        const len = parseInt(line, 10);
        if (len === -1) {
          return [null, crlfIdx + 2];
        }
        const start = crlfIdx + 2;
        if (buffer.length < start + len + 2) {
          return [null, 0];
        }
        const data = buffer.slice(start, start + len);
        return [data, start + len + 2];
      }
      case '*': { // Array
        const count = parseInt(line, 10);
        if (count === -1) {
          return [null, crlfIdx + 2];
        }
        let offset = crlfIdx + 2;
        const arr = [];
        for (let i = 0; i < count; i++) {
          const [val, bytesRead] = this._parseNext(buffer.slice(offset));
          if (bytesRead === 0) {
            return [null, 0];
          }
          arr.push(val);
          offset += bytesRead;
        }
        return [arr, offset];
      }
      default:
        throw new Error(`UnknownRESPType: Unknown symbol prefix "${type}"`);
    }
  }
}
