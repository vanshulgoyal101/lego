import { describe, it, expect } from '../../../test/test-harness.js';
import { encode, decode } from './index.js';

await describe('encoding/bencode', async () => {
  await it('should correctly encode and decode integers, strings, lists and dictionaries', () => {
    const data = {
      announce: 'http://tracker.example.com/announce',
      info: {
        length: 123456,
        name: 'testfile.txt',
        'piece length': 16384,
        pieces: ['piece1', 'piece2']
      }
    };

    const encoded = encode(data);
    const decoded = decode(encoded);

    expect(decoded.announce).toBe(data.announce);
    expect(decoded.info.length).toBe(data.info.length);
    expect(decoded.info.name).toBe(data.info.name);
    expect(decoded.info.pieces).toEqual(data.info.pieces);
  });

  await it('should handle simple integers and negative coordinates', () => {
    expect(decode(encode(42))).toBe(42);
    expect(decode(encode(-15))).toBe(-15);
  });
});
