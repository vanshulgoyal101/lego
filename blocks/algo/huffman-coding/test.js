import { describe, it, expect } from '../../../test/test-harness.js';
import { HuffmanCoding } from './index.js';

await describe('algo/huffman-coding', async () => {
  await it('should compress text to binary strings and correctly decompress back to original text', () => {
    const coder = new HuffmanCoding();
    const original = 'this is a huffman compression test';

    const encoded = coder.encode(original);
    expect(encoded.length > 0).toBe(true);

    const decoded = coder.decode(encoded);
    expect(decoded).toBe(original);
  });

  await it('should handle single character repetitions correctly', () => {
    const coder = new HuffmanCoding();
    const original = 'aaaaa';

    const encoded = coder.encode(original);
    const decoded = coder.decode(encoded);
    expect(decoded).toBe(original);
  });
});
