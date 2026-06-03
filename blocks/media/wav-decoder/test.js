import { describe, it, expect } from '../../../test/test-harness.js';
import { decode } from './index.js';

await describe('media/wav-decoder', async () => {
  await it('should decode a valid mock mono 16-bit PCM WAV buffer', () => {
    // Construct a minimal 16-bit PCM Mono WAV file in memory
    // Header size: 44 bytes
    // Data size: 4 bytes (2 samples of 16-bit)
    const totalSize = 44 + 4;
    const arrayBuffer = new ArrayBuffer(totalSize);
    const view = new DataView(arrayBuffer);

    // RIFF header
    view.setUint32(0, 0x52494646, false); // "RIFF"
    view.setUint32(4, totalSize - 8, true); // chunk size
    view.setUint32(8, 0x57415645, false); // "WAVE"

    // "fmt " chunk
    view.setUint32(12, 0x666d7420, false); // "fmt "
    view.setUint32(16, 16, true);          // chunk size
    view.setUint16(20, 1, true);           // format: 1 (PCM)
    view.setUint16(22, 1, true);           // channels: 1 (Mono)
    view.setUint32(24, 44100, true);       // sample rate: 44100
    view.setUint32(28, 88200, true);       // byte rate
    view.setUint16(32, 2, true);           // block align
    view.setUint16(34, 16, true);          // bits per sample: 16

    // "data" chunk
    view.setUint32(36, 0x64617461, false); // "data"
    view.setUint32(40, 4, true);           // data size: 4 bytes
    // Samples: 0 and 16384 (which is 0.5 normalized)
    view.setInt16(44, 0, true);
    view.setInt16(46, 16384, true);

    const result = decode(new Uint8Array(arrayBuffer));
    expect(result.sampleRate).toBe(44100);
    expect(result.numChannels).toBe(1);
    expect(result.bitsPerSample).toBe(16);
    expect(result.channelData.length).toBe(1);
    expect(result.channelData[0].length).toBe(2);
    expect(result.channelData[0][0]).toBe(0);
    expect(result.channelData[0][1]).toBe(0.5);
  });

  await it('should decode a valid mock stereo 8-bit PCM WAV buffer', () => {
    // Header size: 44 bytes
    // Data size: 4 bytes (2 samples of stereo 8-bit)
    const totalSize = 44 + 4;
    const arrayBuffer = new ArrayBuffer(totalSize);
    const view = new DataView(arrayBuffer);

    // RIFF header
    view.setUint32(0, 0x52494646, false); // "RIFF"
    view.setUint32(4, totalSize - 8, true);
    view.setUint32(8, 0x57415645, false);

    // "fmt " chunk
    view.setUint32(12, 0x666d7420, false);
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true); // PCM
    view.setUint16(22, 2, true); // Stereo
    view.setUint32(24, 22050, true);
    view.setUint32(28, 44100, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 8, true); // 8-bit

    // "data" chunk
    view.setUint32(36, 0x64617461, false);
    view.setUint32(40, 4, true);

    // 8-bit unsigned PCM. Center is 128.
    // Left: 128 (0.0), Right: 256 (unsigned overflows to 255 -> 0.992)
    view.setUint8(44, 128); // Sample 1 Left
    view.setUint8(45, 255); // Sample 1 Right
    view.setUint8(46, 64);  // Sample 2 Left ((64-128)/128 = -0.5)
    view.setUint8(47, 128); // Sample 2 Right

    const result = decode(new Uint8Array(arrayBuffer));
    expect(result.sampleRate).toBe(22050);
    expect(result.numChannels).toBe(2);
    expect(result.bitsPerSample).toBe(8);
    expect(result.channelData[0][0]).toBe(0);
    expect(result.channelData[1][0] > 0.9).toBe(true);
    expect(result.channelData[0][1]).toBe(-0.5);
  });
});
