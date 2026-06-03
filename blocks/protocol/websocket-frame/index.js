/**
 * RFC 6455 WebSocket frame serializer and parser.
 */

/**
 * Serializes a WebSocket frame object into a binary Buffer.
 * @param {Object} frame
 * @param {boolean} [frame.fin=true]
 * @param {boolean} [frame.rsv1=false]
 * @param {boolean} [frame.rsv2=false]
 * @param {boolean} [frame.rsv3=false]
 * @param {number} [frame.opcode=1] - 0: continuation, 1: text, 2: binary, 8: close, 9: ping, 10: pong
 * @param {boolean} [frame.mask=false]
 * @param {Buffer|Uint8Array} [frame.maskingKey] - 4-byte masking key. Generated if mask is true and not provided.
 * @param {Buffer|string|Uint8Array} [frame.payload]
 * @returns {Buffer}
 */
export function serialize(frame) {
  const fin = frame.fin !== false;
  const rsv1 = !!frame.rsv1;
  const rsv2 = !!frame.rsv2;
  const rsv3 = !!frame.rsv3;
  const opcode = frame.opcode !== undefined ? frame.opcode : 1;
  const mask = !!frame.mask;
  const payload = typeof frame.payload === 'string'
    ? Buffer.from(frame.payload, 'utf8')
    : Buffer.from(frame.payload || []);

  const firstByte = (fin ? 0x80 : 0) |
                    (rsv1 ? 0x40 : 0) |
                    (rsv2 ? 0x20 : 0) |
                    (rsv3 ? 0x10 : 0) |
                    (opcode & 0x0F);

  let lenByte = 0;
  let extLenBuf = null;

  if (payload.length <= 125) {
    lenByte = payload.length;
  } else if (payload.length <= 65535) {
    lenByte = 126;
    extLenBuf = Buffer.alloc(2);
    extLenBuf.writeUInt16BE(payload.length, 0);
  } else {
    lenByte = 127;
    extLenBuf = Buffer.alloc(8);
    extLenBuf.writeBigUInt64BE(BigInt(payload.length), 0);
  }

  const secondByte = (mask ? 0x80 : 0) | lenByte;

  const headerChunks = [Buffer.from([firstByte, secondByte])];
  if (extLenBuf) {
    headerChunks.push(extLenBuf);
  }

  let maskingKey = frame.maskingKey;
  if (mask) {
    if (!maskingKey) {
      maskingKey = Buffer.alloc(4);
      for (let i = 0; i < 4; i++) {
        maskingKey[i] = Math.floor(Math.random() * 256);
      }
    } else {
      maskingKey = Buffer.from(maskingKey);
      if (maskingKey.length !== 4) {
        throw new Error('Masking key must be exactly 4 bytes');
      }
    }
    headerChunks.push(maskingKey);
  }

  const header = Buffer.concat(headerChunks);
  const finalPayload = Buffer.alloc(payload.length);
  
  if (mask) {
    for (let i = 0; i < payload.length; i++) {
      finalPayload[i] = payload[i] ^ maskingKey[i % 4];
    }
  } else {
    payload.copy(finalPayload);
  }

  return Buffer.concat([header, finalPayload]);
}

/**
 * Parses a binary Buffer to extract a WebSocket frame.
 * Returns null if the buffer does not contain a complete frame.
 * @param {Buffer} buffer
 * @returns {Object|null} { frame: Object, bytesRead: number } or null
 */
export function deserialize(buffer) {
  if (buffer.length < 2) {
    return null;
  }

  const firstByte = buffer.readUInt8(0);
  const secondByte = buffer.readUInt8(1);

  const fin = (firstByte & 0x80) !== 0;
  const rsv1 = (firstByte & 0x40) !== 0;
  const rsv2 = (firstByte & 0x20) !== 0;
  const rsv3 = (firstByte & 0x10) !== 0;
  const opcode = firstByte & 0x0F;

  const mask = (secondByte & 0x80) !== 0;
  let payloadLen = secondByte & 0x7F;

  let offset = 2;

  if (payloadLen === 126) {
    if (buffer.length < offset + 2) {
      return null;
    }
    payloadLen = buffer.readUInt16BE(offset);
    offset += 2;
  } else if (payloadLen === 127) {
    if (buffer.length < offset + 8) {
      return null;
    }
    const val = buffer.readBigUInt64BE(offset);
    payloadLen = Number(val);
    offset += 8;
  }

  let maskingKey = null;
  if (mask) {
    if (buffer.length < offset + 4) {
      return null;
    }
    maskingKey = buffer.subarray(offset, offset + 4);
    offset += 4;
  }

  if (buffer.length < offset + payloadLen) {
    return null;
  }

  const rawPayload = buffer.subarray(offset, offset + payloadLen);
  const payload = Buffer.alloc(payloadLen);

  if (mask) {
    for (let i = 0; i < payloadLen; i++) {
      payload[i] = rawPayload[i] ^ maskingKey[i % 4];
    }
  } else {
    rawPayload.copy(payload);
  }

  return {
    frame: {
      fin,
      rsv1,
      rsv2,
      rsv3,
      opcode,
      mask,
      maskingKey: maskingKey ? Buffer.from(maskingKey) : null,
      payload
    },
    bytesRead: offset + payloadLen
  };
}
