function readVarint(bytes, offset) {
  let value = 0n;
  let shift = 0n;
  let bytesRead = 0;
  while (offset + bytesRead < bytes.length) {
    const byte = bytes[offset + bytesRead];
    value |= BigInt(byte & 0x7F) << shift;
    bytesRead++;
    if ((byte & 0x80) === 0) {
      return { value, bytesRead };
    }
    shift += 7n;
  }
  throw new Error('UnexpectedEOF: Incomplete varint stream.');
}

/**
 * Decode schema-less Protocol Buffers binary data
 *
 * @param {Uint8Array|Buffer|number[]} buffer - Protobuf binary bytes
 * @returns {Array} Array of parsed fields { fieldNumber, wireType, value }
 */
export function decodeProtobuf(buffer) {
  const bytes = new Uint8Array(buffer);
  let offset = 0;
  const fields = [];

  while (offset < bytes.length) {
    const { value: tagVal, bytesRead: tagBytes } = readVarint(bytes, offset);
    offset += tagBytes;

    const tag = Number(tagVal);
    const fieldNumber = tag >> 3;
    const wireType = tag & 0x07;

    let value;
    if (wireType === 0) {
      // Varint
      const { value: v, bytesRead: vBytes } = readVarint(bytes, offset);
      value = v;
      offset += vBytes;
    } else if (wireType === 1) {
      // 64-bit
      if (offset + 8 > bytes.length) throw new Error('UnexpectedEOF');
      value = bytes.slice(offset, offset + 8);
      offset += 8;
    } else if (wireType === 2) {
      // Length-delimited
      const { value: lenVal, bytesRead: lenBytes } = readVarint(bytes, offset);
      offset += lenBytes;
      const len = Number(lenVal);
      if (offset + len > bytes.length) throw new Error('UnexpectedEOF');
      const data = bytes.slice(offset, offset + len);
      offset += len;

      // Try recursive parsing
      try {
        if (data.length === 0) throw new Error('EmptyNested');
        const nested = decodeProtobuf(data);
        value = { bytes: data, nested };
      } catch {
        // Text fallback
        try {
          const text = new TextDecoder('utf-8', { fatal: true }).decode(data);
          value = text;
        } catch {
          value = data;
        }
      }
    } else if (wireType === 5) {
      // 32-bit
      if (offset + 4 > bytes.length) throw new Error('UnexpectedEOF');
      value = bytes.slice(offset, offset + 4);
      offset += 4;
    } else {
      throw new Error(`UnsupportedWireType: ${wireType}`);
    }

    fields.push({ fieldNumber, wireType, value });
  }

  return fields;
}
export default decodeProtobuf;
