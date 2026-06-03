import { describe, it, expect } from '../../../test/test-harness.js';
import { parsePngMetadata } from './index.js';

await describe('media/png-metadata', async () => {
  it('should parse metadata and text annotations from a valid PNG buffer', () => {
    // Construct a mock PNG buffer
    const signature = [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A];
    
    // IHDR chunk: length 13, type IHDR, width 200, height 150, bit depth 8, color type 6, compression 0, filter 0, interlace 1
    const ihdrData = [
      0x00, 0x00, 0x00, 0x0D, // Length (13)
      0x49, 0x48, 0x44, 0x52, // "IHDR"
      0x00, 0x00, 0x00, 0xC8, // Width: 200
      0x00, 0x00, 0x00, 0x96, // Height: 150
      0x08,                   // Bit depth
      0x06,                   // Color type
      0x00,                   // Compression
      0x00,                   // Filter
      0x01,                   // Interlace
      0x00, 0x00, 0x00, 0x00  // CRC (dummy)
    ];

    // tEXt chunk: keyword "Title", null byte, "Mock Image"
    // keyword "Title" is [0x54, 0x69, 0x74, 0x6C, 0x65]
    // null byte is [0x00]
    // text "Mock Image" is [0x4D, 0x6F, 0x63, 0x6B, 0x20, 0x49, 0x6D, 0x61, 0x67, 0x65]
    // Total text chunk data length = 5 + 1 + 10 = 16
    const textData = [
      0x00, 0x00, 0x00, 0x10, // Length (16)
      0x74, 0x45, 0x58, 0x74, // "tEXt"
      0x54, 0x69, 0x74, 0x6C, 0x65, // "Title"
      0x00, // Null terminator
      0x4D, 0x6F, 0x63, 0x6B, 0x20, 0x49, 0x6D, 0x61, 0x67, 0x65, // "Mock Image"
      0x00, 0x00, 0x00, 0x00  // CRC (dummy)
    ];

    // IEND chunk: length 0, type IEND
    const iendData = [
      0x00, 0x00, 0x00, 0x00, // Length (0)
      0x49, 0x45, 0x4E, 0x44, // "IEND"
      0x00, 0x00, 0x00, 0x00  // CRC (dummy)
    ];

    const fullBuffer = new Uint8Array([
      ...signature,
      ...ihdrData,
      ...textData,
      ...iendData
    ]);

    const result = parsePngMetadata(fullBuffer);

    expect(result.width).toBe(200);
    expect(result.height).toBe(150);
    expect(result.bitDepth).toBe(8);
    expect(result.colorType).toBe(6);
    expect(result.compressionMethod).toBe(0);
    expect(result.filterMethod).toBe(0);
    expect(result.interlaceMethod).toBe(1);
    expect(result.text.Title).toBe('Mock Image');
  });

  it('should throw error on invalid signature', () => {
    const invalidBuffer = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]);
    expect(() => parsePngMetadata(invalidBuffer)).toThrow();
  });

  it('should throw error on too short buffer', () => {
    const shortBuffer = new Uint8Array([0x89, 0x50]);
    expect(() => parsePngMetadata(shortBuffer)).toThrow();
  });
});
