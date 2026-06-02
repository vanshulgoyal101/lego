import { describe, it, expect } from '../../../test/test-harness.js';
import {parseMarkdown} from './index.js';

  await describe('text/markdown-parser', async () => {
    await it('should parse headings, inline bold, and links', async () => {
      const md = '# Header\nThis is **bold** text with a [link](https://ref.com)';
      const parsed = parseMarkdown(md);
      expect(parsed.includes('<h1>Header</h1>')).toBe(true);
      expect(parsed.includes('<strong>bold</strong>')).toBe(true);
      expect(parsed.includes('<a href="https://ref.com">link</a>')).toBe(true);
    });
  });
