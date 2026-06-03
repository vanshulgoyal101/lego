import { describe, it, expect } from '../../../test/test-harness.js';
import { sanitizeHtml } from './index.js';

describe('security/sanitizer', () => {
  it('should allow clean html tags and attributes', () => {
    const input = '<div id="main" class="container"><p>Hello <strong>World</strong>!</p><br /></div>';
    const output = sanitizeHtml(input);
    expect(output).toBe('<div id="main" class="container"><p>Hello <strong>World</strong>!</p><br /></div>');
  });

  it('should strip script tags and other forbidden tags', () => {
    const input = '<div>Safe</div><script>alert("XSS")</script><iframe src="malicious.html"></iframe>';
    const output = sanitizeHtml(input);
    expect(output).toBe('<div>Safe</div>');
  });

  it('should remove disallowed attributes and on* events', () => {
    const input = '<p id="para" onclick="exploit()" data-custom="123">Content</p>';
    const output = sanitizeHtml(input);
    // data-custom and onclick are not in default allowlist
    expect(output).toBe('<p id="para">Content</p>');
  });

  it('should sanitize javascript protocol URLs in href/src', () => {
    const payloads = [
      '<a href="javascript:alert(1)">Link 1</a>',
      '<a href="JAVASCRIPT:alert(2)">Link 2</a>',
      '<a href="java\nscript:alert(3)">Link 3</a>',
      '<a href="j&#x61;vascript:alert(4)">Link 4</a>',
      '<img src="javascript:alert(5)" />',
      '<a href="data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==">Data URL</a>'
    ];

    for (const payload of payloads) {
      const sanitized = sanitizeHtml(payload);
      expect(sanitized.includes('javascript:')).toBe(false);
      expect(sanitized.includes('data:')).toBe(false);
    }
  });

  it('should allow safe protocols in links and images', () => {
    const input = '<a href="https://google.com">Google</a><img src="http://example.com/logo.png" />';
    const output = sanitizeHtml(input);
    expect(output).toBe('<a href="https://google.com">Google</a><img src="http://example.com/logo.png" />');
  });

  it('should support stripping all tags', () => {
    const input = '<h1>Title</h1><p>Paragraph with <b>bold</b> text.</p>';
    const output = sanitizeHtml(input, { stripTags: true });
    expect(output).toBe('TitleParagraph with bold text.');
  });

  it('should respect custom allowed tags and attributes', () => {
    const input = '<custom-tag attr1="1" attr2="2">Hello</custom-tag><div>Standard</div>';
    const output = sanitizeHtml(input, {
      allowedTags: ['custom-tag'],
      allowedAttributes: {
        'custom-tag': ['attr1']
      }
    });
    expect(output).toBe('<custom-tag attr1="1">Hello</custom-tag>');
  });
});
