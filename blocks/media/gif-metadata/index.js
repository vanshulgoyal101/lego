/**
 * Parses GIF metadata including logical screen descriptor, global color table properties,
 * and frames descriptor with delay times.
 * @param {Uint8Array|ArrayBuffer|Buffer} buffer - The GIF file buffer.
 * @returns {Object} Parsed GIF metadata.
 */
export function parseGifMetadata(buffer) {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  
  if (bytes.length < 13) {
    throw new Error('Invalid GIF buffer: too short');
  }

  // Check header
  const signature = String.fromCharCode(bytes[0], bytes[1], bytes[2]);
  if (signature !== 'GIF') {
    throw new Error('Invalid GIF signature');
  }
  const version = String.fromCharCode(bytes[3], bytes[4], bytes[5]);
  if (version !== '87a' && version !== '89a') {
    throw new Error(`Unsupported GIF version: ${version}`);
  }

  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const width = view.getUint16(6, true);
  const height = view.getUint16(8, true);
  const packed = bytes[10];
  const backgroundColorIndex = bytes[11];
  
  const globalColorTableFlag = (packed & 0x80) !== 0;
  const globalColorTableSize = globalColorTableFlag ? (1 << ((packed & 0x07) + 1)) : 0;

  const metadata = {
    width,
    height,
    backgroundColorIndex,
    globalColorTable: {
      exists: globalColorTableFlag,
      size: globalColorTableSize
    },
    frames: []
  };

  let offset = 13;
  if (globalColorTableFlag) {
    offset += globalColorTableSize * 3;
  }

  let nextDelayTime = 0;

  while (offset < bytes.length) {
    const blockType = bytes[offset];
    if (blockType === 0x3B) {
      // Trailer, end of GIF
      break;
    }

    if (blockType === 0x21) {
      // Extension block
      if (offset + 2 > bytes.length) {
        throw new Error('Malformed GIF: extension block too short');
      }
      const label = bytes[offset + 1];
      offset += 2;

      if (label === 0xF9) {
        // Graphic Control Extension
        if (offset + 6 > bytes.length) {
          throw new Error('Malformed GIF: GCE block too short');
        }
        const blockSize = bytes[offset]; // should be 4
        const delayTimeVal = view.getUint16(offset + 2, true);
        nextDelayTime = delayTimeVal * 10; // convert hundredths of a second to milliseconds
        offset += 1 + blockSize + 1; // size byte + data bytes + terminator
      } else {
        // Other extension, read sub-blocks
        while (offset < bytes.length) {
          const subBlockSize = bytes[offset];
          if (subBlockSize === 0) {
            offset += 1;
            break;
          }
          offset += 1 + subBlockSize;
        }
      }
    } else if (blockType === 0x2C) {
      // Image Descriptor
      if (offset + 10 > bytes.length) {
        throw new Error('Malformed GIF: image descriptor too short');
      }
      const left = view.getUint16(offset + 1, true);
      const top = view.getUint16(offset + 3, true);
      const w = view.getUint16(offset + 5, true);
      const h = view.getUint16(offset + 7, true);
      const imagePacked = bytes[offset + 9];
      const localColorTableFlag = (imagePacked & 0x80) !== 0;
      const interlaced = (imagePacked & 0x40) !== 0;
      
      offset += 10;

      if (localColorTableFlag) {
        const localColorTableSize = 1 << ((imagePacked & 0x07) + 1);
        offset += localColorTableSize * 3;
      }

      // Skip image data blocks
      if (offset >= bytes.length) {
        throw new Error('Malformed GIF: missing image data code size');
      }
      // LZW minimum code size
      offset += 1;

      while (offset < bytes.length) {
        const subBlockSize = bytes[offset];
        if (subBlockSize === 0) {
          offset += 1;
          break;
        }
        offset += 1 + subBlockSize;
      }

      metadata.frames.push({
        left,
        top,
        width: w,
        height: h,
        interlaced,
        delayTime: nextDelayTime
      });

      nextDelayTime = 0; // reset for next frame
    } else {
      // Unknown block, increment offset to avoid infinite loop
      offset++;
    }
  }

  return metadata;
}
