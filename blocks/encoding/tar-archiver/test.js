import { describe, it, expect } from '../../../test/test-harness.js';
import {pack, unpack} from './index.js';

  await describe('encoding/tar-archiver', async () => {
    await it('should pack and unpack a single text file correctly', () => {
      const files = [{
        name: 'hello.txt',
        content: 'Hello, World!',
        mode: 0o644
      }];
      const archive = pack(files);
      expect(archive instanceof Uint8Array).toBe(true);
      expect(archive.byteLength % 512).toBe(0); // Must be 512-byte aligned

      const extracted = unpack(archive);
      expect(extracted.length).toBe(1);
      expect(extracted[0].name).toBe('hello.txt');
      expect(new TextDecoder().decode(extracted[0].content)).toBe('Hello, World!');
    });

    await it('should pack and unpack multiple files', () => {
      const files = [
        { name: 'a.txt', content: 'File A content' },
        { name: 'b.txt', content: 'File B content' },
        { name: 'subdir/c.txt', content: 'File C in subdir' }
      ];
      const archive = pack(files);
      const extracted = unpack(archive);
      expect(extracted.length).toBe(3);
      expect(extracted[0].name).toBe('a.txt');
      expect(extracted[1].name).toBe('b.txt');
      expect(extracted[2].name).toBe('subdir/c.txt');
      expect(new TextDecoder().decode(extracted[2].content)).toBe('File C in subdir');
    });

    await it('should preserve file sizes accurately', () => {
      const content = 'x'.repeat(600); // > 512 bytes to span multiple blocks
      const archive = pack([{ name: 'large.txt', content }]);
      const extracted = unpack(archive);
      expect(extracted[0].size).toBe(600);
      expect(extracted[0].content.byteLength).toBe(600);
    });

    await it('should pack Uint8Array content directly', () => {
      const binary = new Uint8Array([0x89, 0x50, 0x4e, 0x47]); // PNG magic bytes
      const archive = pack([{ name: 'image.png', content: binary }]);
      const extracted = unpack(archive);
      expect(extracted[0].content[0]).toBe(0x89);
      expect(extracted[0].content[3]).toBe(0x47);
    });
  });
