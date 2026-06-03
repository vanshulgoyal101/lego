import { describe, it, expect } from '../../../test/test-harness.js';
import {compileMarkdown, renderHtml} from './index.js';

  await describe('text/markdown-compiler', async () => {
    await it('should parse markdown structures and render sanitized HTML', () => {
      const md = `# Title\n\nThis is a **bold** paragraph.\n\n- item 1\n- item 2`;
      const ast = compileMarkdown(md);
      expect(ast.length).toBe(3);
      expect(ast[0].type).toBe('heading');
      expect(ast[1].type).toBe('paragraph');

      const html = renderHtml(ast);
      expect(html.includes('<h1>Title</h1>')).toBe(true);
      expect(html.includes('<p>This is a <strong>bold</strong> paragraph.</p>')).toBe(true);
    });

    await it('should sanitize javascript: links containing control characters/whitespace', () => {
      const links = [
        '[x](javascript:alert(1))',
        '[x](java\tscript:alert(1))',
        '[x](java\nscript:alert(1))',
        '[x](java\rscript:alert(1))',
        '[x]( java script:alert(1))',
      ];
      for (const link of links) {
        const ast = compileMarkdown(link);
        const html = renderHtml(ast);
        expect(html.includes('href="#"')).toBe(true);
      }
    });
  });
