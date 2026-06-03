/**
 * Extracts metadata and text annotations from a PNG binary buffer.
 * @param {Uint8Array|ArrayBuffer|Buffer} buffer - The PNG file buffer.
 * @returns {Object} Extracted PNG metadata.
 */
export function parsePngMetadata(buffer) {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  
  // Verify PNG signature: 89 50 4E 47 0D 0A 1A 0A
  const signature = [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A];
  if (bytes.length < 8) {
    throw new Error('Invalid PNG buffer: too short');
  }
  for (let i = 0; i < 8; i++) {
    if (bytes[i] !== signature[i]) {
      throw new Error('Invalid PNG signature');
    }
  }

  let offset = 8;
  const metadata = {
    width: null,
    height: null,
    bitDepth: null,
    colorType: null,
    compressionMethod: null,
    filterMethod: null,
    interlaceMethod: null,
    text: {}
  };

  // We construct a DataView on the buffer or subset thereof to parse numbers.
  // Note: DataView needs to correctly reference the underlying ArrayBuffer offset.
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);

  while (offset + 8 <= bytes.length) {
    const length = view.getUint32(offset, false);
    const chunkType = String.fromCharCode(
      bytes[offset + 4],
      bytes[offset + 5],
      bytes[offset + 6],
      bytes[offset + 7]
    );

    const dataStart = offset + 8;
    if (dataStart + length > bytes.length) {
      throw new Error(`Malformed PNG: chunk ${chunkType} exceeds buffer bounds`);
    }

    if (chunkType === 'IHDR') {
      if (length < 13) {
        throw new Error('Malformed IHDR chunk: too short');
      }
      metadata.width = view.getUint32(dataStart, false);
      metadata.height = view.getUint32(dataStart + 4, false);
      metadata.bitDepth = bytes[dataStart + 8];
      metadata.colorType = bytes[dataStart + 9];
      metadata.compressionMethod = bytes[dataStart + 10];
      metadata.filterMethod = bytes[dataStart + 11];
      metadata.interlaceMethod = bytes[dataStart + 12];
    } else if (chunkType === 'tEXt') {
      // Find null terminator for keyword
      let nullIndex = -1;
      for (let i = 0; i < length; i++) {
        if (bytes[dataStart + i] === 0) {
          nullIndex = i;
          break;
        }
      }
      if (nullIndex !== -1) {
        const keywordBytes = bytes.subarray(dataStart, dataStart + nullIndex);
        const textBytes = bytes.subarray(dataStart + nullIndex + 1, dataStart + length);
        
        // Text is latin-1. Let's decode manually to avoid dependency on global TextDecoder with non-utf8 format
        // in environments that might not support it, or we can use custom decoder.
        const decodeLatin1 = (arr) => {
          let str = '';
          for (let j = 0; j < arr.length; j++) {
            str += String.fromCharCode(arr[j]);
          }
          return str;
        };

        const keyword = decodeLatin1(keywordBytes);
        const textValue = decodeLatin1(textBytes);
        metadata.text[keyword] = textValue;
      }
    } else if (chunkType === 'IEND') {
      break;
    }

    // Chunk size is: 4 (length) + 4 (type) + length (data) + 4 (CRC)
    offset += 12 + length;
  }

  if (metadata.width === null) {
    throw new Error('Missing IHDR chunk in PNG');
  }

  return metadata;
}
