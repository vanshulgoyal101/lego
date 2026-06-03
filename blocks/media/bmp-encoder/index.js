/**
 * 24-bit Uncompressed BMP Image Encoder.
 */

/**
 * Encodes raw RGB pixel data into a 24-bit BMP file buffer.
 *
 * @param {number} width - Image width in pixels
 * @param {number} height - Image height in pixels
 * @param {Uint8Array|number[]} pixelData - Flat array of RGB values: [r0, g0, b0, r1, g1, b1, ...]
 * @returns {Uint8Array} Binary BMP file content
 */
export function encode(width, height, pixelData) {
  if (!width || !height || !pixelData) {
    throw new Error('InvalidInput: Width, height, and pixelData are required');
  }
  if (pixelData.length < width * height * 3) {
    throw new Error('InvalidInput: Pixel data array is too small for the specified dimensions');
  }

  const rowSize = Math.ceil((width * 3) / 4) * 4;
  const paddingSize = rowSize - (width * 3);
  const pixelDataSize = rowSize * height;
  const fileSize = 54 + pixelDataSize;

  const buffer = new ArrayBuffer(fileSize);
  const view = new DataView(buffer);
  const uint8View = new Uint8Array(buffer);

  // 1. File Header (14 bytes)
  view.setUint16(0, 0x424D, false);     // Signature: "BM" (0x42, 0x4D)
  view.setUint32(2, fileSize, true);    // File Size
  view.setUint16(6, 0, true);           // Reserved 1
  view.setUint16(8, 0, true);           // Reserved 2
  view.setUint32(10, 54, true);         // Offset to pixel data (54 bytes)

  // 2. DIB Info Header (40 bytes)
  view.setUint32(14, 40, true);         // Info header size (40)
  view.setInt32(18, width, true);       // Width
  view.setInt32(22, height, true);      // Height (positive = bottom-to-top layout)
  view.setUint16(26, 1, true);          // Color planes (1)
  view.setUint16(28, 24, true);         // Bits per pixel (24 for RGB)
  view.setUint32(30, 0, true);          // Compression: 0 (uncompressed BI_RGB)
  view.setUint32(34, pixelDataSize, true); // Image data size
  view.setInt32(38, 2835, true);        // H Resolution (2835 pixels/meter, ~72 DPI)
  view.setInt32(42, 2835, true);        // V Resolution (2835 pixels/meter, ~72 DPI)
  view.setUint32(46, 0, true);          // Palette colors (0)
  view.setUint32(50, 0, true);          // Important colors (0)

  // 3. Pixel Data
  // BMP stores rows from bottom-to-top.
  let destOffset = 54;
  for (let y = height - 1; y >= 0; y--) {
    const srcRowOffset = y * width * 3;
    for (let x = 0; x < width; x++) {
      const srcIdx = srcRowOffset + x * 3;
      const r = pixelData[srcIdx];
      const g = pixelData[srcIdx + 1];
      const b = pixelData[srcIdx + 2];

      // BMP stores pixels in Blue-Green-Red (BGR) order
      uint8View[destOffset++] = b;
      uint8View[destOffset++] = g;
      uint8View[destOffset++] = r;
    }
    // Pad row to multiple of 4 bytes
    for (let p = 0; p < paddingSize; p++) {
      uint8View[destOffset++] = 0;
    }
  }

  return uint8View;
}

export default {
  encode
};
