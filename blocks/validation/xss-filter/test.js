import { describe, it, expect } from '../../../test/test-harness.js';
import {sanitize, escapeHtml, stripTags} from './index.js';

  await describe('validation/xss-filter', async () => {
    await it('should remove script tags', () => {
      const input = '<p>Hello</p><script>alert("xss")</script>';
      const result = sanitize(input);
      expect(result.includes('<script>')).toBe(false);
      expect(result.includes('<p>Hello</p>')).toBe(true);
    });

    await it('should remove on* event handler attributes', () => {
      const input = '<a href="#" onclick="steal()">Click</a>';
      const result = sanitize(input);
      expect(result.includes('onclick')).toBe(false);
      expect(result.includes('<a')).toBe(true);
    });

    await it('should block javascript: protocol in href', () => {
      const input = '<a href="javascript:alert(1)">Link</a>';
      const result = sanitize(input);
      expect(result.includes('javascript:')).toBe(false);
    });

    await it('should allow safe tags and attributes', () => {
      const input = '<div class="box"><p>Safe content</p><strong>Bold</strong></div>';
      const result = sanitize(input);
      expect(result.includes('<div')).toBe(true);
      expect(result.includes('<p>Safe content</p>')).toBe(true);
      expect(result.includes('<strong>Bold</strong>')).toBe(true);
    });

    await it('should escape HTML entities with escapeHtml', () => {
      const escaped = escapeHtml('<script>alert("xss")</script>');
      expect(escaped.includes('<script>')).toBe(false);
      expect(escaped.includes('&lt;script&gt;')).toBe(true);
    });

    await it('should strip all tags with stripTags', () => {
      const result = stripTags('<b>Hello</b> <i>World</i>');
      expect(result.includes('<b>')).toBe(false);
      expect(result.includes('Hello')).toBe(true);
      expect(result.includes('World')).toBe(true);
    });

    await it('should remove iframe and embed tags', () => {
      const input = '<iframe src="evil.com"></iframe><embed src="x.swf">';
      const result = sanitize(input);
      expect(result.includes('iframe')).toBe(false);
      expect(result.includes('embed')).toBe(false);
    });
  });
