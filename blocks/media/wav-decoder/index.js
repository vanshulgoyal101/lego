/**
 * RIFF/WAV Audio Decoder.
 */

/**
 * Decodes a binary WAV file buffer into audio metadata and normalized float channel data.
 *
 * @param {ArrayBuffer|Uint8Array} buffer - Binary WAV data buffer
 * @returns {{ sampleRate: number, numChannels: number, bitsPerSample: number, channelData: Float32Array[] }} Decoded audio
 */
export function decode(buffer) {
  const arrayBuffer = buffer.buffer || buffer;
  const view = new DataView(arrayBuffer, buffer.byteOffset || 0, buffer.byteLength || arrayBuffer.byteLength);

  // 1. Verify RIFF Header
  if (view.getUint32(0, false) !== 0x52494646) { // "RIFF"
    throw new Error('InvalidFormat: Not a valid RIFF file');
  }

  // 2. Verify WAVE format
  if (view.getUint32(8, false) !== 0x57415645) { // "WAVE"
    throw new Error('InvalidFormat: Not a valid WAVE file');
  }

  let offset = 12;
  let numChannels = 0;
  let sampleRate = 0;
  let bitsPerSample = 0;
  let audioFormat = 0;
  let dataFound = false;
  let dataOffset = 0;
  let dataSize = 0;

  // 3. Parse chunks
  while (offset < view.byteLength) {
    if (offset + 8 > view.byteLength) break;
    const chunkId = view.getUint32(offset, false);
    const chunkSize = view.getUint32(offset + 4, true);
    offset += 8;

    if (chunkId === 0x666d7420) { // "fmt "
      audioFormat = view.getUint16(offset, true);
      numChannels = view.getUint16(offset + 2, true);
      sampleRate = view.getUint32(offset + 4, true);
      bitsPerSample = view.getUint16(offset + 14, true);
    } else if (chunkId === 0x64617461) { // "data"
      dataFound = true;
      dataOffset = offset;
      dataSize = chunkSize;
      break; // Usually data is the last main chunk, or we stop scanning
    }

    offset += chunkSize;
    // Align to 2 bytes
    if (chunkSize % 2 !== 0) {
      offset++;
    }
  }

  if (!dataFound) {
    throw new Error('InvalidFormat: "data" chunk not found');
  }

  if (audioFormat !== 1 && audioFormat !== 3) {
    throw new Error(`UnsupportedFeature: Only PCM (1) and IEEE Float (3) audio formats are supported (found ${audioFormat})`);
  }

  const bytesPerSample = bitsPerSample / 8;
  const numSamples = Math.floor(dataSize / (numChannels * bytesPerSample));
  const channelData = Array.from({ length: numChannels }, () => new Float32Array(numSamples));

  let bytePtr = dataOffset;
  for (let s = 0; s < numSamples; s++) {
    for (let c = 0; c < numChannels; c++) {
      if (bytePtr + bytesPerSample > view.byteLength) {
        break;
      }
      let sample = 0;
      if (audioFormat === 1) { // PCM
        if (bitsPerSample === 8) {
          // 8-bit unsigned PCM
          const u8 = view.getUint8(bytePtr);
          sample = (u8 - 128) / 128;
        } else if (bitsPerSample === 16) {
          // 16-bit signed PCM
          const s16 = view.getInt16(bytePtr, true);
          sample = s16 / 32768;
        } else if (bitsPerSample === 24) {
          // 24-bit signed PCM (3 bytes, little-endian)
          const b0 = view.getUint8(bytePtr);
          const b1 = view.getUint8(bytePtr + 1);
          const b2 = view.getUint8(bytePtr + 2);
          // Sign-extend from 24-bit to 32-bit
          let s24 = (b0 | (b1 << 8) | (b2 << 16));
          if (s24 & 0x800000) {
            s24 |= 0xFF000000;
          }
          sample = s24 / 8388608;
        } else if (bitsPerSample === 32) {
          // 32-bit signed PCM
          const s32 = view.getInt32(bytePtr, true);
          sample = s32 / 2147483648;
        }
      } else if (audioFormat === 3) { // IEEE Float
        if (bitsPerSample === 32) {
          sample = view.getFloat32(bytePtr, true);
        } else if (bitsPerSample === 64) {
          sample = view.getFloat64(bytePtr, true);
        }
      }
      channelData[c][s] = sample;
      bytePtr += bytesPerSample;
    }
  }

  return {
    sampleRate,
    numChannels,
    bitsPerSample,
    channelData
  };
}

export default {
  decode
};
