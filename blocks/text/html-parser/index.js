export class HtmlParser {
  /**
   * Parses an HTML string into an Abstract Syntax Tree (AST).
   * @param {string} html - HTML string to parse.
   * @returns {Object[]} Array of root AST nodes.
   */
  static parse(html) {
    if (typeof html !== 'string') {
      throw new Error('Input must be a string');
    }

    const ast = [];
    const stack = [];
    let currentParent = { children: ast };

    // Regex to match tags
    const tagRegex = /<(?:\/([a-zA-Z0-9:-]+)|([a-zA-Z0-9:-]+)([^>]*?))>/g;
    let lastIndex = 0;
    let match;

    const selfClosingTags = new Set([
      'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
      'link', 'meta', 'param', 'source', 'track', 'wbr'
    ]);

    while ((match = tagRegex.exec(html)) !== null) {
      const matchIndex = match.index;

      // 1. Text node before the current tag
      if (matchIndex > lastIndex) {
        const textContent = html.slice(lastIndex, matchIndex);
        if (textContent.trim()) {
          currentParent.children.push({
            type: 'text',
            content: textContent
          });
        }
      }

      const [fullTag, closeTagName, openTagName, rawAttributes] = match;

      if (closeTagName) {
        // 2. Closing Tag
        const upperClose = closeTagName.toLowerCase();
        if (stack.length > 0) {
          // Find matching open tag in stack (handling missing closing tags gracefully)
          let foundIdx = -1;
          for (let i = stack.length - 1; i >= 0; i--) {
            if (stack[i].name === upperClose) {
              foundIdx = i;
              break;
            }
          }

          if (foundIdx !== -1) {
            stack.splice(foundIdx); // pop elements up to matching tag
            currentParent = stack.length > 0 ? stack[stack.length - 1] : { children: ast };
          }
        }
      } else if (openTagName) {
        // 3. Opening Tag
        const name = openTagName.toLowerCase();
        const attributes = this.parseAttributes(rawAttributes);
        const isSelfClosing = selfClosingTags.has(name) || rawAttributes.endsWith('/');

        const node = {
          type: 'tag',
          name,
          attributes,
          children: []
        };

        currentParent.children.push(node);

        if (!isSelfClosing) {
          stack.push(node);
          currentParent = node;
        }
      }

      lastIndex = tagRegex.lastIndex;
    }

    // 4. Trailing text node
    if (lastIndex < html.length) {
      const trailingText = html.slice(lastIndex);
      if (trailingText.trim()) {
        currentParent.children.push({
          type: 'text',
          content: trailingText
        });
      }
    }

    return ast;
  }

  static parseAttributes(rawAttributes) {
    const attributes = {};
    if (!rawAttributes) {
      return attributes;
    }

    // Matches key="value", key='value', or key=value, or key
    const attrRegex = /([a-zA-Z0-9:-]+)(?:\s*=\s*(?:'([^']*)'|"([^"]*)"|([^\s>]+)))?/g;
    let match;
    while ((match = attrRegex.exec(rawAttributes)) !== null) {
      const name = match[1];
      const val = match[2] !== undefined ? match[2] : (match[3] !== undefined ? match[3] : (match[4] !== undefined ? match[4] : true));
      attributes[name] = val;
    }
    return attributes;
  }
}
