const DEFAULT_ALLOWED_TAGS = new Set([
  'a', 'abbr', 'b', 'blockquote', 'br', 'code', 'del', 'div', 'em', 'h1', 'h2', 'h3',
  'h4', 'h5', 'h6', 'hr', 'i', 'img', 'ins', 'li', 'ol', 'p', 'pre', 'span', 'strong',
  'sub', 'sup', 'table', 'tbody', 'td', 'th', 'thead', 'tr', 'ul'
]);

const DEFAULT_ALLOWED_ATTRIBUTES = {
  '*': ['class', 'id', 'title', 'lang', 'dir'],
  'a': ['href', 'target', 'rel'],
  'img': ['src', 'alt', 'width', 'height']
};

const DEFAULT_ALLOWED_SCHEMES = new Set(['http', 'https', 'mailto', 'tel']);

function decodeHtmlEntities(str) {
  return str
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/&#([0-9]+);/g, (_, dec) => String.fromCharCode(parseInt(dec, 10)));
}

function parseAttributes(attrStr) {
  const attrs = new Map();
  const attrRegex = /([a-zA-Z0-9_:-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]*)))?/g;
  let match;
  while ((match = attrRegex.exec(attrStr)) !== null) {
    const name = match[1].toLowerCase();
    const value = match[2] !== undefined ? match[2] : (match[3] !== undefined ? match[3] : (match[4] || ''));
    attrs.set(name, value);
  }
  return attrs;
}

function isSafeUrl(urlStr, allowedSchemes) {
  const decoded = decodeHtmlEntities(urlStr).replace(/[\s\u0000-\u001F]/g, '').toLowerCase();
  
  if (decoded.startsWith('/') || decoded.startsWith('#') || decoded.startsWith('./') || decoded.startsWith('../')) {
    return true;
  }

  const colonIndex = decoded.indexOf(':');
  if (colonIndex === -1) {
    return true;
  }

  const scheme = decoded.slice(0, colonIndex);
  return allowedSchemes.has(scheme);
}

export function sanitizeHtml(html, options = {}) {
  if (typeof html !== 'string') return '';

  let input = html.replace(/\u0000/g, '');

  const allowedTags = options.allowedTags ? new Set(options.allowedTags) : DEFAULT_ALLOWED_TAGS;
  const allowedAttributes = options.allowedAttributes || DEFAULT_ALLOWED_ATTRIBUTES;
  const allowedSchemes = options.allowedSchemes ? new Set(options.allowedSchemes) : DEFAULT_ALLOWED_SCHEMES;
  const stripAll = options.stripTags || false;

  let result = '';
  let i = 0;
  
  const disallowedStack = [];
  const allowedStack = [];

  while (i < input.length) {
    if (input[i] !== '<') {
      let nextLessThan = input.indexOf('<', i);
      if (nextLessThan === -1) nextLessThan = input.length;
      const text = input.slice(i, nextLessThan);
      if (disallowedStack.length === 0) {
        result += text;
      }
      i = nextLessThan;
      continue;
    }

    if (input.startsWith('<!--', i)) {
      const commentEnd = input.indexOf('-->', i);
      i = commentEnd === -1 ? input.length : commentEnd + 3;
      continue;
    }

    if (input.startsWith('<!', i) || input.startsWith('<?', i)) {
      const end = input.indexOf('>', i);
      i = end === -1 ? input.length : end + 1;
      continue;
    }

    const end = input.indexOf('>', i);
    if (end === -1) {
      if (!stripAll && disallowedStack.length === 0) {
        result += '&lt;' + input.slice(i + 1).replace(/</g, '&lt;');
      }
      break;
    }

    const rawTag = input.slice(i, end + 1);
    const isClosing = rawTag.startsWith('</');
    const isSelfClosing = rawTag.endsWith('/>');

    const tagContent = rawTag.replace(/^<\/?|\/?>$/g, '').trim();
    const spaceIndex = tagContent.indexOf(' ');
    
    let tagName = (spaceIndex === -1 ? tagContent : tagContent.slice(0, spaceIndex)).toLowerCase();
    const attrStr = spaceIndex === -1 ? '' : tagContent.slice(spaceIndex + 1);

    if (stripAll) {
      i = end + 1;
      continue;
    }

    const FORBIDDEN_TAGS = new Set(['script', 'iframe', 'style', 'object', 'embed', 'link', 'meta', 'applet']);
    const isAllowed = allowedTags.has(tagName) && !FORBIDDEN_TAGS.has(tagName);

    if (isClosing) {
      if (disallowedStack.length > 0 && disallowedStack[disallowedStack.length - 1] === tagName) {
        disallowedStack.pop();
      } else if (allowedStack.length > 0 && allowedStack[allowedStack.length - 1] === tagName) {
        allowedStack.pop();
        if (disallowedStack.length === 0) {
          result += `</${tagName}>`;
        }
      }
    } else {
      const selfClosing = isSelfClosing || ['br', 'hr', 'img', 'input'].includes(tagName);
      if (!isAllowed || disallowedStack.length > 0) {
        if (!selfClosing) {
          disallowedStack.push(tagName);
        }
      } else {
        const parsedAttrs = parseAttributes(attrStr);
        let sanitizedAttrs = '';

        const allowedForTag = allowedAttributes[tagName] || [];
        const allowedGlobal = allowedAttributes['*'] || [];
        const allAllowedAttrs = new Set([...allowedForTag, ...allowedGlobal]);

        for (const [name, val] of parsedAttrs.entries()) {
          if (name.startsWith('on')) continue;
          if (!allAllowedAttrs.has(name)) continue;

          if (name === 'href' || name === 'src' || name === 'action' || name === 'formaction') {
            if (!isSafeUrl(val, allowedSchemes)) continue;
          }

          const cleanVal = val
            .replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');

          sanitizedAttrs += ` ${name}="${cleanVal}"`;
        }

        result += `<${tagName}${sanitizedAttrs}${selfClosing ? ' /' : ''}>`;
        if (!selfClosing) {
          allowedStack.push(tagName);
        }
      }
    }

    i = end + 1;
  }

  return result;
}
