import { describe, it, expect } from '../../../test/test-harness.js';
import { encode } from './index.js';

await describe('media/bmp-encoder', async () => {
  await it('should encode a simple 2x2 red and blue pixel grid correctly', () => {
    // 2x2 pixels (each row needs 2 * 3 = 6 bytes, padded to 8 bytes)
    // Row 1 (top): Pixel(0,0)=Red [255,0,0], Pixel(1,0)=Blue [0,0,255]
    // Row 2 (bottom): Pixel(0,1)=Green [0,255,0], Pixel(1,1)=White [255,255,255]
    const pixels = [
      255, 0, 0,    0, 0, 255,     // Row 1 (top)
      0, 255, 0,    255, 255, 255  // Row 2 (bottom)
    ];

    const bmpBytes = encode(2, 2, pixels);
    const view = new DataView(bmpBytes.buffer);

    // Verify BMP File Header
    expect(view.getUint16(0, false)).toBe(0x424D); // "BM"
    expect(view.getUint32(2, true)).toBe(54 + 16); // File size: 54 header + (8 bytes per row * 2 rows)
    expect(view.getUint32(10, true)).toBe(54);     // Pixel data offset

    // Verify DIB Header
    expect(view.getUint32(14, true)).toBe(40);     // Header size
    expect(view.getInt32(18, true)).toBe(2);       // Width
    expect(view.getInt32(22, true)).toBe(2);       // Height
    expect(view.getUint16(26, true)).toBe(1);      // Planes
    expect(view.getUint16(28, true)).toBe(24);     // 24-bit

    // Verify Pixel Data (remember BMP stores bottom row first)
    // Bottom row: Green [0,255,0] and White [255,255,255].
    // Green in BGR is: 0, 255, 0
    // White in BGR is: 255, 255, 255
    // Followed by 2 bytes padding.
    expect(bmpBytes[54]).toBe(0);     // Green B
    expect(bmpBytes[55]).toBe(255);   // Green G
    expect(bmpBytes[56]).toBe(0);     // Green R
    expect(bmpBytes[57]).toBe(255);   // White B
    expect(bmpBytes[58]).toBe(255);   // White G
    expect(bmpBytes[59]).toBe(255);   // White R
    expect(bmpBytes[60]).toBe(0);     // Padding
    expect(bmpBytes[61]).toBe(0);     // Padding

    // Top row: Red [255,0,0] and Blue [0,0,255].
    // Red in BGR is: 0, 0, 255
    // Blue in BGR is: 255, 0, 0
    // Followed by 2 bytes padding.
    expect(bmpBytes[62]).toBe(0);     // Red B
    expect(bmpBytes[63]).toBe(0);     // Red G
    expect(bmpBytes[64]).toBe(255);   // Red R
    expect(bmpBytes[65]).toBe(255);   // Blue B
    expect(bmpBytes[66]).toBe(0);     // Blue G
    expect(bmpBytes[67]).toBe(0);     // Blue R
    expect(bmpBytes[68]).toBe(0);     // Padding
    expect(bmpBytes[69]).toBe(0);     // Padding
  });
});
