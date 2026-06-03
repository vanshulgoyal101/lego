import { describe, it, expect } from '../../../test/test-harness.js';
import { parseGifMetadata } from './index.js';

await describe('media/gif-metadata', async () => {
  it('should parse a valid mock GIF buffer correctly', () => {
    const mockGif = new Uint8Array([
      // Header
      0x47, 0x49, 0x46, 0x38, 0x39, 0x61, // "GIF89a"
      // LSD
      0x0A, 0x00, // Width: 10
      0x14, 0x00, // Height: 20
      0x80,       // Packed (Global Color table flag set, size = 2 colors)
      0x01,       // Background Color Index: 1
      0x00,       // Pixel Aspect Ratio
      // GCT (6 bytes)
      0xFF, 0x00, 0x00,
      0x00, 0x00, 0xFF,
      // Graphic Control Extension
      0x21, 0xF9, 0x04, 0x00, 0x0B, 0x00, 0x00, 0x00, // Delay time: 11 (110ms)
      // Image Descriptor
      0x2C,
      0x00, 0x00, // Left
      0x00, 0x00, // Top
      0x05, 0x00, // Width: 5
      0x05, 0x00, // Height: 5
      0x00,       // Packed: no local color table
      0x02,       // LZW minimum code size
      0x01, 0x00, // 1 byte data
      0x00,       // Terminator
      // Trailer
      0x3B
    ]);

    const metadata = parseGifMetadata(mockGif);

    expect(metadata.width).toBe(10);
    expect(metadata.height).toBe(20);
    expect(metadata.backgroundColorIndex).toBe(1);
    expect(metadata.globalColorTable.exists).toBe(true);
    expect(metadata.globalColorTable.size).toBe(2);
    expect(metadata.frames.length).toBe(1);
    expect(metadata.frames[0].width).toBe(5);
    expect(metadata.frames[0].height).toBe(5);
    expect(metadata.frames[0].delayTime).toBe(110);
  });

  it('should throw on invalid signature', () => {
    const invalid = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]);
    expect(() => parseGifMetadata(invalid)).toThrow();
  });
});
