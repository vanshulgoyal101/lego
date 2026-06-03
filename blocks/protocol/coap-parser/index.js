/**
 * RFC 7252 CoAP packet parser and serializer.
 */

const OPTION_NUMBERS = {
  'if-match': 1,
  'uri-host': 3,
  'etag': 4,
  'if-none-match': 5,
  'uri-port': 7,
  'location-path': 8,
  'uri-path': 11,
  'content-format': 12,
  'max-age': 14,
  'uri-query': 15,
  'accept': 17,
  'location-query': 20,
  'proxy-uri': 35,
  'proxy-scheme': 39,
  'size1': 60
};

const OPTION_NAMES = Object.fromEntries(
  Object.entries(OPTION_NUMBERS).map(([k, v]) => [v, k])
);

function encodeUint(val) {
  if (val === 0) return Buffer.alloc(0);
  if (val <= 0xFF) {
    const buf = Buffer.alloc(1);
    buf.writeUInt8(val, 0);
    return buf;
  }
  if (val <= 0xFFFF) {
    const buf = Buffer.alloc(2);
    buf.writeUInt16BE(val, 0);
    return buf;
  }
  if (val <= 0xFFFFFFFF) {
    const buf = Buffer.alloc(4);
    buf.writeUInt32BE(val, 0);
    return buf;
  }
  const buf = Buffer.alloc(8);
  buf.writeBigUInt64BE(BigInt(val), 0);
  return buf;
}

function decodeUint(buf) {
  if (buf.length === 0) return 0;
  if (buf.length === 1) return buf.readUInt8(0);
  if (buf.length === 2) return buf.readUInt16BE(0);
  if (buf.length === 4) return buf.readUInt32BE(0);
  if (buf.length === 8) return Number(buf.readBigUInt64BE(0));
  throw new Error(`Invalid uint length: ${buf.length}`);
}

function encodeDeltaOrLength(value) {
  if (value < 13) {
    return { val: value, ext: Buffer.alloc(0) };
  } else if (value < 269) {
    const ext = Buffer.alloc(1);
    ext.writeUInt8(value - 13, 0);
    return { val: 13, ext };
  } else if (value < 65805) {
    const ext = Buffer.alloc(2);
    ext.writeUInt16BE(value - 269, 0);
    return { val: 14, ext };
  } else {
    throw new Error('Value too large for CoAP option delta/length');
  }
}

/**
 * Serializes a CoAP message object into a binary Buffer.
 * @param {Object} message
 * @param {number} [message.version=1]
 * @param {number} [message.type=0] - 0: CON, 1: NON, 2: ACK, 3: RST
 * @param {Buffer|Uint8Array} [message.token] - Token up to 8 bytes.
 * @param {number|string} message.code - Request/Response Code (e.g., 1 for GET, "2.05" for Content).
 * @param {number} [message.messageId=0] - 16-bit message ID.
 * @param {Array<Object>} [message.options] - [{ name: string|number, value: string|Buffer|number }]
 * @param {Buffer|string} [message.payload]
 * @returns {Buffer}
 */
export function serialize(message) {
  const version = message.version !== undefined ? message.version : 1;
  if (version !== 1) {
    throw new Error('Only CoAP version 1 is supported');
  }

  const type = message.type !== undefined ? message.type : 0;
  const token = message.token ? Buffer.from(message.token) : Buffer.alloc(0);
  if (token.length > 8) {
    throw new Error('Token length must not exceed 8 bytes');
  }

  let code = message.code;
  if (typeof code === 'string') {
    const parts = code.split('.');
    if (parts.length === 2) {
      code = (parseInt(parts[0], 10) << 5) | parseInt(parts[1], 10);
    } else {
      code = parseInt(code, 10);
    }
  }
  if (code === undefined || isNaN(code)) {
    throw new Error('Valid message code is required');
  }

  const messageId = message.messageId || 0;

  const optionList = [];
  if (Array.isArray(message.options)) {
    for (const opt of message.options) {
      let optNumber = opt.name;
      if (typeof optNumber === 'string') {
        const lowerName = optNumber.toLowerCase();
        if (OPTION_NUMBERS[lowerName] !== undefined) {
          optNumber = OPTION_NUMBERS[lowerName];
        } else {
          optNumber = parseInt(optNumber, 10);
        }
      }
      if (isNaN(optNumber)) {
        throw new Error(`Invalid option name/number: ${opt.name}`);
      }

      let valBuf;
      if (Buffer.isBuffer(opt.value) || opt.value instanceof Uint8Array) {
        valBuf = Buffer.from(opt.value);
      } else if (typeof opt.value === 'string') {
        valBuf = Buffer.from(opt.value, 'utf8');
      } else if (typeof opt.value === 'number') {
        valBuf = encodeUint(opt.value);
      } else if (opt.value === undefined || opt.value === null) {
        valBuf = Buffer.alloc(0);
      } else {
        throw new Error(`Unsupported option value type: ${typeof opt.value}`);
      }

      optionList.push({ number: optNumber, value: valBuf });
    }
  }

  // Options MUST be sorted by option number ascending
  optionList.sort((a, b) => a.number - b.number);

  const header = Buffer.alloc(4);
  const firstByte = (version << 6) | (type << 4) | token.length;
  header.writeUInt8(firstByte, 0);
  header.writeUInt8(code, 1);
  header.writeUInt16BE(messageId, 2);

  const chunks = [header];
  if (token.length > 0) {
    chunks.push(token);
  }

  let lastOptionNumber = 0;
  for (const opt of optionList) {
    const delta = opt.number - lastOptionNumber;
    lastOptionNumber = opt.number;

    const deltaEnc = encodeDeltaOrLength(delta);
    const lenEnc = encodeDeltaOrLength(opt.value.length);

    const optionHeaderByte = (deltaEnc.val << 4) | lenEnc.val;
    chunks.push(Buffer.from([optionHeaderByte]));
    if (deltaEnc.ext.length > 0) chunks.push(deltaEnc.ext);
    if (lenEnc.ext.length > 0) chunks.push(lenEnc.ext);
    chunks.push(opt.value);
  }

  if (message.payload !== undefined && message.payload !== null) {
    const payloadBuf = typeof message.payload === 'string'
      ? Buffer.from(message.payload, 'utf8')
      : Buffer.from(message.payload);

    if (payloadBuf.length > 0) {
      chunks.push(Buffer.from([0xFF])); // Payload marker
      chunks.push(payloadBuf);
    }
  }

  return Buffer.concat(chunks);
}

/**
 * Parses a Buffer into a CoAP message object.
 * Returns null if the buffer does not contain a complete CoAP packet.
 * @param {Buffer} buffer
 * @returns {Object|null} { message: Object, bytesRead: number } or null
 */
export function deserialize(buffer) {
  if (buffer.length < 4) {
    return null;
  }

  const firstByte = buffer.readUInt8(0);
  const version = (firstByte >> 6) & 0x03;
  if (version !== 1) {
    throw new Error('Only CoAP version 1 is supported');
  }

  const type = (firstByte >> 4) & 0x03;
  const tokenLength = firstByte & 0x0F;
  if (tokenLength > 8) {
    throw new Error('Token length must not exceed 8 bytes');
  }

  const codeByte = buffer.readUInt8(1);
  const codeClass = codeByte >> 5;
  const codeDetail = codeByte & 0x1F;
  const codeStr = `${codeClass}.${codeDetail.toString().padStart(2, '0')}`;

  const messageId = buffer.readUInt16BE(2);

  let offset = 4;

  if (buffer.length < offset + tokenLength) {
    return null;
  }
  const token = buffer.subarray(offset, offset + tokenLength);
  offset += tokenLength;

  const options = [];
  let currentOptionNumber = 0;
  let hasPayload = false;

  while (offset < buffer.length) {
    const nextByte = buffer.readUInt8(offset);
    if (nextByte === 0xFF) {
      hasPayload = true;
      offset += 1;
      break;
    }

    offset += 1;

    let delta = nextByte >> 4;
    let length = nextByte & 0x0F;

    if (delta === 13) {
      if (offset + 1 > buffer.length) return null;
      delta = buffer.readUInt8(offset) + 13;
      offset += 1;
    } else if (delta === 14) {
      if (offset + 2 > buffer.length) return null;
      delta = buffer.readUInt16BE(offset) + 269;
      offset += 2;
    } else if (delta === 15) {
      throw new Error('Reserved option delta value 15 encountered');
    }

    if (length === 13) {
      if (offset + 1 > buffer.length) return null;
      length = buffer.readUInt8(offset) + 13;
      offset += 1;
    } else if (length === 14) {
      if (offset + 2 > buffer.length) return null;
      length = buffer.readUInt16BE(offset) + 269;
      offset += 2;
    } else if (length === 15) {
      throw new Error('Reserved option length value 15 encountered');
    }

    if (offset + length > buffer.length) {
      return null;
    }

    const valueBuf = buffer.subarray(offset, offset + length);
    offset += length;

    currentOptionNumber += delta;

    const optName = OPTION_NAMES[currentOptionNumber] || currentOptionNumber;
    
    let value = valueBuf;
    const stringOpts = ['uri-host', 'location-path', 'uri-path', 'uri-query', 'location-query', 'proxy-uri', 'proxy-scheme'];
    const uintOpts = ['uri-port', 'content-format', 'max-age', 'accept', 'size1'];

    if (typeof optName === 'string') {
      if (stringOpts.includes(optName)) {
        value = valueBuf.toString('utf8');
      } else if (uintOpts.includes(optName)) {
        value = decodeUint(valueBuf);
      }
    }

    options.push({
      name: optName,
      value
    });
  }

  let payload = Buffer.alloc(0);
  if (hasPayload) {
    payload = buffer.subarray(offset);
  }

  return {
    message: {
      version,
      type,
      token: Buffer.from(token),
      code: codeByte,
      codeString: codeStr,
      messageId,
      options,
      payload: Buffer.from(payload)
    },
    bytesRead: hasPayload ? buffer.length : offset
  };
}
