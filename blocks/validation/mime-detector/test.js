import { describe, it, expect } from '../../../test/test-harness.js';
import { detectMime } from './index.js';

await describe('validation/mime-detector', async () => {
  await it('should correctly identify common file mime types from binary buffers', () => {
    // PNG buffer
    const png = new Uint8Array([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0, 0]);
    expect(detectMime(png)).toBe('image/png');

    // JPEG buffer
    const jpeg = new Uint8Array([0xFF, 0xD8, 0xFF, 0xE0, 0, 0]);
    expect(detectMime(jpeg)).toBe('image/jpeg');

    // PDF buffer
    const pdf = new Uint8Array([0x25, 0x50, 0x44, 0x46, 10, 10]);
    expect(detectMime(pdf)).toBe('application/pdf');

    // Text buffer
    const text = new TextEncoder().encode('Hello world plain text');
    expect(detectMime(text)).toBe('text/plain');

    // JSON buffer
    const json = new TextEncoder().encode('{ "key": "value" }');
    expect(detectMime(json)).toBe('application/json');
  });
});
