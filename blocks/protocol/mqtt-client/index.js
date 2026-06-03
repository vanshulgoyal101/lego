/**
 * MQTT v3.1.1 packet parser and serializer.
 * Supports: CONNECT, CONNACK, PUBLISH, PUBACK, SUBSCRIBE, SUBACK.
 */

// Helper to write a variable length integer (Remaining Length)
function writeVarInt(num) {
  const bytes = [];
  do {
    let digit = num % 128;
    num = Math.floor(num / 128);
    if (num > 0) {
      digit = digit | 0x80;
    }
    bytes.push(digit);
  } while (num > 0);
  return Buffer.from(bytes);
}

// Helper to read a variable length integer (Remaining Length)
function readVarInt(buffer, offset) {
  let value = 0;
  let multiplier = 1;
  let len = 0;
  let digit;
  do {
    if (offset + len >= buffer.length) {
      throw new Error('Malformed variable length integer');
    }
    digit = buffer[offset + len];
    value += (digit & 127) * multiplier;
    multiplier *= 128;
    len++;
    if (multiplier > 128 * 128 * 128) {
      throw new Error('Variable length integer too large');
    }
  } while ((digit & 128) !== 0);
  return { value, len };
}

// Helper to write a UTF-8 encoded string (2-byte length prefix)
function writeString(str) {
  const strBuf = Buffer.from(str, 'utf8');
  const buf = Buffer.alloc(2 + strBuf.length);
  buf.writeUInt16BE(strBuf.length, 0);
  strBuf.copy(buf, 2);
  return buf;
}

// Helper to read a UTF-8 encoded string
function readString(buffer, offset) {
  if (offset + 2 > buffer.length) {
    throw new Error('Buffer overrun reading string length');
  }
  const len = buffer.readUInt16BE(offset);
  if (offset + 2 + len > buffer.length) {
    throw new Error('Buffer overrun reading string data');
  }
  const str = buffer.toString('utf8', offset + 2, offset + 2 + len);
  return { value: str, len: 2 + len };
}

/**
 * Serializes an MQTT packet object into a Buffer.
 * @param {Object} packet
 * @returns {Buffer}
 */
export function serialize(packet) {
  if (!packet || typeof packet.type !== 'string') {
    throw new Error('Packet type is required');
  }

  const type = packet.type.toUpperCase();
  let typeByte = 0;
  const chunks = [];

  if (type === 'CONNECT') {
    typeByte = 0x10;
    
    // Variable Header
    chunks.push(writeString('MQTT')); // Protocol Name
    
    const levelBuf = Buffer.alloc(1);
    levelBuf.writeUInt8(4, 0); // Protocol Level: 4 (v3.1.1)
    chunks.push(levelBuf);

    let connectFlags = 0;
    if (packet.cleanSession !== false) connectFlags |= 0x02;
    if (packet.will) {
      connectFlags |= 0x04;
      connectFlags |= ((packet.will.qos || 0) & 0x03) << 3;
      if (packet.will.retain) connectFlags |= 0x20;
    }
    if (packet.username) connectFlags |= 0x80;
    if (packet.password) connectFlags |= 0x40;

    const flagsBuf = Buffer.alloc(1);
    flagsBuf.writeUInt8(connectFlags, 0);
    chunks.push(flagsBuf);

    const keepAliveBuf = Buffer.alloc(2);
    keepAliveBuf.writeUInt16BE(packet.keepAlive !== undefined ? packet.keepAlive : 60, 0);
    chunks.push(keepAliveBuf);

    // Payload
    chunks.push(writeString(packet.clientId || ''));

    if (packet.will) {
      chunks.push(writeString(packet.will.topic));
      const willPayload = typeof packet.will.payload === 'string'
        ? Buffer.from(packet.will.payload, 'utf8')
        : Buffer.from(packet.will.payload || []);
      const willPayloadLen = Buffer.alloc(2);
      willPayloadLen.writeUInt16BE(willPayload.length, 0);
      chunks.push(willPayloadLen, willPayload);
    }

    if (packet.username) {
      chunks.push(writeString(packet.username));
    }

    if (packet.password) {
      const passBuf = typeof packet.password === 'string'
        ? Buffer.from(packet.password, 'utf8')
        : Buffer.from(packet.password);
      const passLen = Buffer.alloc(2);
      passLen.writeUInt16BE(passBuf.length, 0);
      chunks.push(passLen, passBuf);
    }

  } else if (type === 'CONNACK') {
    typeByte = 0x20;
    const body = Buffer.alloc(2);
    body.writeUInt8(packet.sessionPresent ? 1 : 0, 0);
    body.writeUInt8(packet.returnCode || 0, 1);
    chunks.push(body);

  } else if (type === 'PUBLISH') {
    let flags = 0;
    if (packet.dup) flags |= 0x08;
    flags |= ((packet.qos || 0) & 0x03) << 1;
    if (packet.retain) flags |= 0x01;
    typeByte = 0x30 | flags;

    chunks.push(writeString(packet.topic));

    if ((packet.qos || 0) > 0) {
      if (packet.packetId === undefined) {
        throw new Error('packetId is required for QoS > 0');
      }
      const idBuf = Buffer.alloc(2);
      idBuf.writeUInt16BE(packet.packetId, 0);
      chunks.push(idBuf);
    }

    const payload = typeof packet.payload === 'string'
      ? Buffer.from(packet.payload, 'utf8')
      : Buffer.from(packet.payload || []);
    chunks.push(payload);

  } else if (type === 'PUBACK') {
    typeByte = 0x40;
    const idBuf = Buffer.alloc(2);
    idBuf.writeUInt16BE(packet.packetId || 0, 0);
    chunks.push(idBuf);

  } else if (type === 'SUBSCRIBE') {
    typeByte = 0x82; // Must be 0x82
    const idBuf = Buffer.alloc(2);
    idBuf.writeUInt16BE(packet.packetId || 0, 0);
    chunks.push(idBuf);

    if (!Array.isArray(packet.subscriptions) || packet.subscriptions.length === 0) {
      throw new Error('subscriptions must be a non-empty array');
    }

    for (const sub of packet.subscriptions) {
      chunks.push(writeString(sub.topic));
      const qosBuf = Buffer.alloc(1);
      qosBuf.writeUInt8(sub.qos || 0, 0);
      chunks.push(qosBuf);
    }

  } else if (type === 'SUBACK') {
    typeByte = 0x90;
    const idBuf = Buffer.alloc(2);
    idBuf.writeUInt16BE(packet.packetId || 0, 0);
    chunks.push(idBuf);

    if (!Array.isArray(packet.grantedQos)) {
      throw new Error('grantedQos must be an array');
    }

    const qosBuf = Buffer.alloc(packet.grantedQos.length);
    for (let i = 0; i < packet.grantedQos.length; i++) {
      qosBuf.writeUInt8(packet.grantedQos[i], i);
    }
    chunks.push(qosBuf);

  } else {
    throw new Error(`Unsupported serialization packet type: ${packet.type}`);
  }

  const vhpBuffer = Buffer.concat(chunks);
  const fixedHeader = Buffer.alloc(1);
  fixedHeader.writeUInt8(typeByte, 0);
  const remainingLengthBuf = writeVarInt(vhpBuffer.length);

  return Buffer.concat([fixedHeader, remainingLengthBuf, vhpBuffer]);
}

/**
 * Deserializes a Buffer into an MQTT packet object.
 * Returns null if the buffer doesn't contain a complete packet yet.
 * @param {Buffer} buffer
 * @returns {Object|null} { packet: Object, bytesRead: number } or null
 */
export function deserialize(buffer) {
  if (buffer.length < 2) {
    return null;
  }

  const typeByte = buffer.readUInt8(0);
  const typeNum = typeByte >> 4;
  
  let type;
  switch (typeNum) {
    case 1: type = 'CONNECT'; break;
    case 2: type = 'CONNACK'; break;
    case 3: type = 'PUBLISH'; break;
    case 4: type = 'PUBACK'; break;
    case 8: type = 'SUBSCRIBE'; break;
    case 9: type = 'SUBACK'; break;
    default: throw new Error(`Unsupported packet type: ${typeNum}`);
  }

  let varInt;
  try {
    varInt = readVarInt(buffer, 1);
  } catch (err) {
    return null;
  }

  const headerLen = 1 + varInt.len;
  if (buffer.length < headerLen + varInt.value) {
    return null;
  }

  const packetBuf = buffer.subarray(headerLen, headerLen + varInt.value);
  let offset = 0;
  const result = { type };

  if (type === 'CONNECT') {
    const protoName = readString(packetBuf, offset);
    offset += protoName.len;
    if (protoName.value !== 'MQTT') {
      throw new Error(`Invalid protocol name: ${protoName.value}`);
    }

    const level = packetBuf.readUInt8(offset);
    offset += 1;
    if (level !== 4) {
      throw new Error(`Unsupported protocol level: ${level}`);
    }

    const connectFlags = packetBuf.readUInt8(offset);
    offset += 1;

    const usernameFlag = (connectFlags & 0x80) !== 0;
    const passwordFlag = (connectFlags & 0x40) !== 0;
    const willRetain = (connectFlags & 0x20) !== 0;
    const willQos = (connectFlags >> 3) & 0x03;
    const willFlag = (connectFlags & 0x04) !== 0;
    result.cleanSession = (connectFlags & 0x02) !== 0;

    result.keepAlive = packetBuf.readUInt16BE(offset);
    offset += 2;

    const client = readString(packetBuf, offset);
    result.clientId = client.value;
    offset += client.len;

    if (willFlag) {
      const willTopic = readString(packetBuf, offset);
      offset += willTopic.len;
      if (offset + 2 > packetBuf.length) {
        throw new Error('Buffer overrun reading Will payload length');
      }
      const willPayloadLen = packetBuf.readUInt16BE(offset);
      offset += 2;
      if (offset + willPayloadLen > packetBuf.length) {
        throw new Error('Buffer overrun reading Will payload');
      }
      const willPayload = packetBuf.subarray(offset, offset + willPayloadLen);
      offset += willPayloadLen;

      result.will = {
        topic: willTopic.value,
        payload: willPayload,
        qos: willQos,
        retain: willRetain
      };
    }

    if (usernameFlag) {
      const username = readString(packetBuf, offset);
      result.username = username.value;
      offset += username.len;
    }

    if (passwordFlag) {
      if (offset + 2 > packetBuf.length) {
        throw new Error('Buffer overrun reading password length');
      }
      const passLen = packetBuf.readUInt16BE(offset);
      offset += 2;
      if (offset + passLen > packetBuf.length) {
        throw new Error('Buffer overrun reading password');
      }
      result.password = packetBuf.subarray(offset, offset + passLen);
      offset += passLen;
    }

  } else if (type === 'CONNACK') {
    const flags = packetBuf.readUInt8(0);
    result.sessionPresent = (flags & 0x01) !== 0;
    result.returnCode = packetBuf.readUInt8(1);

  } else if (type === 'PUBLISH') {
    const dup = (typeByte & 0x08) !== 0;
    const qos = (typeByte >> 1) & 0x03;
    const retain = (typeByte & 0x01) !== 0;

    result.dup = dup;
    result.qos = qos;
    result.retain = retain;

    const topic = readString(packetBuf, offset);
    result.topic = topic.value;
    offset += topic.len;

    if (qos > 0) {
      result.packetId = packetBuf.readUInt16BE(offset);
      offset += 2;
    }

    result.payload = packetBuf.subarray(offset);

  } else if (type === 'PUBACK') {
    result.packetId = packetBuf.readUInt16BE(0);

  } else if (type === 'SUBSCRIBE') {
    result.packetId = packetBuf.readUInt16BE(0);
    offset += 2;

    result.subscriptions = [];
    while (offset < packetBuf.length) {
      const subTopic = readString(packetBuf, offset);
      offset += subTopic.len;
      const qos = packetBuf.readUInt8(offset);
      offset += 1;
      result.subscriptions.push({ topic: subTopic.value, qos });
    }

  } else if (type === 'SUBACK') {
    result.packetId = packetBuf.readUInt16BE(0);
    offset += 2;

    result.grantedQos = [];
    while (offset < packetBuf.length) {
      result.grantedQos.push(packetBuf.readUInt8(offset));
      offset += 1;
    }
  }

  return {
    packet: result,
    bytesRead: headerLen + varInt.value
  };
}
