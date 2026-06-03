export class BBCodeParser {
  /**
   * Compiles BBCode formatted strings into HTML representations.
   * @param {string} input - BBCode string
   * @returns {string} Compiled HTML
   */
  static parse(input) {
    if (typeof input !== 'string') {
      throw new Error('Input must be a string');
    }

    let html = input;

    // Helper to escape HTML characters to prevent XSS in content
    const escapeHtml = (text) => {
      return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    };

    // First escape the entire input to prevent direct HTML injection
    html = escapeHtml(html);

    // Simple BBCode replacements
    const rules = [
      { regex: /\[b\]([\s\S]*?)\[\/b\]/gi, replace: '<strong>$1</strong>' },
      { regex: /\[i\]([\s\S]*?)\[\/i\]/gi, replace: '<em>$1</em>' },
      { regex: /\[u\]([\s\S]*?)\[\/u\]/gi, replace: '<u>$1</u>' },
      { regex: /\[quote\]([\s\S]*?)\[\/quote\]/gi, replace: '<blockquote>$1</blockquote>' },
      { regex: /\[code\]([\s\S]*?)\[\/code\]/gi, replace: '<pre><code>$1</code></pre>' },
      { regex: /\[img\]([\s\S]*?)\[\/img\]/gi, replace: '<img src="$1" />' },
      { regex: /\[url=([^\]]+)\]([\s\S]*?)\[\/url\]/gi, replace: '<a href="$1">$2</a>' },
      { regex: /\[url\]([\s\S]*?)\[\/url\]/gi, replace: '<a href="$1">$1</a>' }
    ];

    // Apply rules repeatedly to handle nesting (up to 3 levels deep)
    for (let depth = 0; depth < 3; depth++) {
      let changed = false;
      for (const rule of rules) {
        const nextHtml = html.replace(rule.regex, rule.replace);
        if (nextHtml !== html) {
          html = nextHtml;
          changed = true;
        }
      }
      if (!changed) break;
    }

    return html;
  }
}
