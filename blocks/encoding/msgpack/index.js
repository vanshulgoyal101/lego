/**
 * Pure JS MessagePack (msgpack) serializer and deserializer.
 * Supports: null, booleans, integers (up to 32-bit safely), floats, strings, arrays, and objects.
 */

const encoder = new TextEncoder();
const decoder = new TextDecoder();

function assertSafeMapKey(key) {
  if (
    typeof key === 'string' &&
    (key === '__proto__' || key === 'prototype' || key === 'constructor')
  ) {
    throw new Error(`Unsafe MsgPack map key: ${key}`);
  }
}

/**
 * Encodes JavaScript values into a MessagePack binary buffer (Uint8Array).
 */
export function encode(val) {
  const chunks = [];
  
  function pushByte(b) {
    chunks.push(new Uint8Array([b]));
  }

  function pushBytes(arr) {
    chunks.push(new Uint8Array(arr));
  }

  function serialize(value) {
    if (value === null || value === undefined) {
      pushByte(0xc0); // nil
      return;
    }

    if (value === true) {
      pushByte(0xc3); // true
      return;
    }

    if (value === false) {
      pushByte(0xc2); // false
      return;
    }

    const type = typeof value;

    if (type === 'number') {
      if (Number.isInteger(value)) {
        if (value >= 0) {
          if (value < 128) {
            pushByte(value); // positive fixnum
          } else if (value < 256) {
            pushBytes([0xcc, value]); // uint 8
          } else if (value < 65536) {
            pushBytes([0xcd, (value >> 8) & 0xff, value & 0xff]); // uint 16
          } else if (value < 4294967296) {
            const buf = new Uint8Array(5);
            buf[0] = 0xce; // uint 32
            const view = new DataView(buf.buffer);
            view.setUint32(1, value, false);
            pushBytes(buf);
          } else {
            // High integers fall back to float64
            const buf = new Uint8Array(9);
            buf[0] = 0xcb; // float 64
            const view = new DataView(buf.buffer);
            view.setFloat64(1, value, false);
            pushBytes(buf);
          }
        } else {
          if (value >= -32) {
            pushByte(0xe0 | (value + 32)); // negative fixnum
          } else if (value >= -128) {
            pushBytes([0xd0, value & 0xff]); // int 8
          } else if (value >= -32768) {
            pushBytes([0xd1, (value >> 8) & 0xff, value & 0xff]); // int 16
          } else {
            const buf = new Uint8Array(5);
            buf[0] = 0xd2; // int 32
            const view = new DataView(buf.buffer);
            view.setInt32(1, value, false);
            pushBytes(buf);
          }
        }
      } else {
        // Float 64
        const buf = new Uint8Array(9);
        buf[0] = 0xcb; // float 64
        const view = new DataView(buf.buffer);
        view.setFloat64(1, value, false);
        pushBytes(buf);
      }
      return;
    }

    if (type === 'string') {
      const strBytes = encoder.encode(value);
      const len = strBytes.length;
      if (len < 32) {
        pushByte(0xa0 | len); // fixstr
      } else if (len < 256) {
        pushBytes([0xd9, len]); // str 8
      } else if (len < 65536) {
        pushBytes([0xda, (len >> 8) & 0xff, len & 0xff]); // str 16
      } else {
        const buf = new Uint8Array(5);
        buf[0] = 0xdb; // str 32
        const view = new DataView(buf.buffer);
        view.setUint32(1, len, false);
        pushBytes(buf);
      }
      pushBytes(strBytes);
      return;
    }

    if (Array.isArray(value)) {
      const len = value.length;
      if (len < 16) {
        pushByte(0x90 | len); // fixarray
      } else if (len < 65536) {
        pushBytes([0xdc, (len >> 8) & 0xff, len & 0xff]); // array 16
      } else {
        const buf = new Uint8Array(5);
        buf[0] = 0xdd; // array 32
        const view = new DataView(buf.buffer);
        view.setUint32(1, len, false);
        pushBytes(buf);
      }
      for (let i = 0; i < len; i++) {
        serialize(value[i]);
      }
      return;
    }

    if (type === 'object') {
      const keys = Object.keys(value);
      const len = keys.length;
      if (len < 16) {
        pushByte(0x80 | len); // fixmap
      } else if (len < 65536) {
        pushBytes([0xde, (len >> 8) & 0xff, len & 0xff]); // map 16
      } else {
        const buf = new Uint8Array(5);
        buf[0] = 0xdf; // map 32
        const view = new DataView(buf.buffer);
        view.setUint32(1, len, false);
        pushBytes(buf);
      }
      for (const k of keys) {
        serialize(k);
        serialize(value[k]);
      }
      return;
    }

    throw new Error(`Unsupported type for MsgPack encoding: ${type}`);
  }

  serialize(val);

  // Combine chunks
  let totalLength = 0;
  for (const chunk of chunks) {
    totalLength += chunk.length;
  }
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }
  return result;
}

/**
 * Decodes a MessagePack binary buffer (Uint8Array) into JavaScript values.
 */
export function decode(buffer) {
  if (!(buffer instanceof Uint8Array)) {
    throw new TypeError('Argument must be a Uint8Array');
  }

  let offset = 0;
  const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);

  function readByte() {
    if (offset >= buffer.length) {
      throw new Error('Unexpected end of MsgPack stream');
    }
    return buffer[offset++];
  }

  function readBytes(len) {
    if (offset + len > buffer.length) {
      throw new Error('Unexpected end of MsgPack stream');
    }
    const res = buffer.subarray(offset, offset + len);
    offset += len;
    return res;
  }

  function deserialize() {
    const byte = readByte();

    // Positive Fixnum
    if (byte < 0x80) return byte;

    // FixMap
    if (byte >= 0x80 && byte < 0x90) {
      const len = byte & 0x0f;
      const res = Object.create(null);
      for (let i = 0; i < len; i++) {
        const key = deserialize();
        assertSafeMapKey(key);
        res[key] = deserialize();
      }
      return res;
    }

    // FixArray
    if (byte >= 0x90 && byte < 0xa0) {
      const len = byte & 0x0f;
      const res = [];
      for (let i = 0; i < len; i++) {
        res.push(deserialize());
      }
      return res;
    }

    // FixStr
    if (byte >= 0xa0 && byte < 0xc0) {
      const len = byte & 0x1f;
      return decoder.decode(readBytes(len));
    }

    // Negative Fixnum
    if (byte >= 0xe0) {
      return byte - 0x100;
    }

    switch (byte) {
      case 0xc0: return null;
      case 0xc2: return false;
      case 0xc3: return true;

      // Float 64
      case 0xcb: {
        const val = view.getFloat64(offset, false);
        offset += 8;
        return val;
      }

      // Uint 8
      case 0xcc: return readByte();

      // Uint 16
      case 0xcd: {
        const val = view.getUint16(offset, false);
        offset += 2;
        return val;
      }

      // Uint 32
      case 0xce: {
        const val = view.getUint32(offset, false);
        offset += 4;
        return val;
      }

      // Int 8
      case 0xd0: {
        const val = view.getInt8(offset);
        offset += 1;
        return val;
      }

      // Int 16
      case 0xd1: {
        const val = view.getInt16(offset, false);
        offset += 2;
        return val;
      }

      // Int 32
      case 0xd2: {
        const val = view.getInt32(offset, false);
        offset += 4;
        return val;
      }

      // Str 8
      case 0xd9: {
        const len = readByte();
        return decoder.decode(readBytes(len));
      }

      // Str 16
      case 0xda: {
        const len = view.getUint16(offset, false);
        offset += 2;
        return decoder.decode(readBytes(len));
      }

      // Str 32
      case 0xdb: {
        const len = view.getUint32(offset, false);
        offset += 4;
        return decoder.decode(readBytes(len));
      }

      // Array 16
      case 0xdc: {
        const len = view.getUint16(offset, false);
        offset += 2;
        const res = [];
        for (let i = 0; i < len; i++) res.push(deserialize());
        return res;
      }

      // Array 32
      case 0xdd: {
        const len = view.getUint32(offset, false);
        offset += 4;
        const res = [];
        for (let i = 0; i < len; i++) res.push(deserialize());
        return res;
      }

      // Map 16
      case 0xde: {
        const len = view.getUint16(offset, false);
        offset += 2;
        const res = Object.create(null);
        for (let i = 0; i < len; i++) {
          const key = deserialize();
          assertSafeMapKey(key);
          res[key] = deserialize();
        }
        return res;
      }

      // Map 32
      case 0xdf: {
        const len = view.getUint32(offset, false);
        offset += 4;
        const res = Object.create(null);
        for (let i = 0; i < len; i++) {
          const key = deserialize();
          assertSafeMapKey(key);
          res[key] = deserialize();
        }
        return res;
      }
    }

    throw new Error(`Unsupported MsgPack identifier header byte: 0x${byte.toString(16)}`);
  }

  return deserialize();
}
