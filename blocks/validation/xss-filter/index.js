/**
 * XSS HTML Sanitizer
 * Strips dangerous tags, event handlers, and protocol-based injection from HTML strings.
 * Supports allowlists for safe tags and attributes.
 */

// Default allowlisted tags
const DEFAULT_ALLOWED_TAGS = new Set([
  'a', 'abbr', 'acronym', 'address', 'article', 'aside', 'b', 'blockquote', 'br',
  'caption', 'cite', 'code', 'col', 'colgroup', 'dd', 'del', 'details', 'dfn', 'div',
  'dl', 'dt', 'em', 'figcaption', 'figure', 'footer', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'header', 'hgroup', 'hr', 'i', 'img', 'ins', 'kbd', 'li', 'main', 'mark', 'menu',
  'nav', 'ol', 'p', 'pre', 'q', 's', 'section', 'small', 'span', 'strong', 'sub',
  'summary', 'sup', 'table', 'tbody', 'td', 'th', 'thead', 'time', 'tr', 'u', 'ul', 'var'
]);

// Default allowlisted attributes
const DEFAULT_ALLOWED_ATTRS = new Set([
  'alt', 'class', 'dir', 'for', 'height', 'href', 'id', 'lang', 'rel',
  'src', 'style', 'title', 'width', 'target', 'colspan', 'rowspan',
  'datetime', 'cite', 'align', 'valign', 'scope'
]);

// Protocols allowed in href/src
const SAFE_PROTOCOLS = new Set(['http:', 'https:', 'mailto:', 'tel:', 'ftp:', '#', '/']);

// Dangerous patterns in attribute values
const DANGEROUS_ATTR_VALUE = /^javascript:|^vbscript:|^data:(?!image\/(png|jpg|jpeg|gif|webp|svg\+xml))/i;

/**
 * Parse an HTML tag into its components.
 * @param {string} tag - The full tag string including < >
 * @returns {{ tagName: string, isClosing: boolean, isSelfClosing: boolean, attrs: Map<string, string> }}
 */
function parseTag(tag) {
  const isClosing = tag.startsWith('</');
  const tagContent = tag.replace(/^<\/?|\/?>$/g, '').trim();
  const parts = tagContent.match(/^(\S+)([\s\S]*)$/);
  if (!parts) return null;

  const tagName = parts[1].toLowerCase();
  const attrStr = parts[2] || '';
  const attrs = new Map();

  // Parse attributes: key="value", key='value', key=value, key
  const attrRegex = /([a-zA-Z][a-zA-Z0-9_:-]*)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]*)))?/g;
  let m;
  while ((m = attrRegex.exec(attrStr)) !== null) {
    const name = m[1].toLowerCase();
    const value = m[2] !== undefined ? m[2] : (m[3] !== undefined ? m[3] : (m[4] || ''));
    attrs.set(name, value);
  }

  return {
    tagName,
    isClosing,
    isSelfClosing: tag.endsWith('/>') || ['br', 'hr', 'img', 'input', 'meta', 'link'].includes(tagName),
    attrs
  };
}

/**
 * Check if an attribute value is safe.
 */
function isSafeAttrValue(attrName, value) {
  if (attrName === 'href' || attrName === 'src' || attrName === 'action') {
    if (DANGEROUS_ATTR_VALUE.test(value.trim())) return false;
  }

  // Block on* event handlers (onclick, onerror, etc.)
  if (/^on\w+/i.test(attrName)) return false;

  return true;
}

/**
 * Sanitize an HTML string, removing dangerous elements and attributes.
 * @param {string} html - Input HTML string to sanitize.
 * @param {Object} [options] - Configuration options.
 * @param {Set<string>} [options.allowedTags] - Custom set of allowed tags.
 * @param {Set<string>} [options.allowedAttrs] - Custom set of allowed attributes.
 * @param {boolean} [options.stripAllTags=false] - If true, strip ALL tags (plain text only).
 * @returns {string} Sanitized HTML string.
 */
export function sanitize(html, options = {}) {
  if (typeof html !== 'string') return '';

  const allowedTags = options.allowedTags || DEFAULT_ALLOWED_TAGS;
  const allowedAttrs = options.allowedAttrs || DEFAULT_ALLOWED_ATTRS;
  const stripAll = options.stripAllTags || false;

  let result = '';
  let i = 0;

  while (i < html.length) {
    if (html[i] !== '<') {
      result += html[i++];
      continue;
    }

    // Find closing >
    let end = html.indexOf('>', i);
    if (end === -1) {
      // Malformed tag - treat as text
      result += html.slice(i).replace(/</g, '&lt;');
      break;
    }

    const rawTag = html.slice(i, end + 1);

    // Skip comments
    if (rawTag.startsWith('<!--')) {
      const commentEnd = html.indexOf('-->', i);
      i = commentEnd === -1 ? html.length : commentEnd + 3;
      continue;
    }

    // Handle CDATA, DOCTYPE
    if (rawTag.startsWith('<!') || rawTag.startsWith('<?')) {
      i = end + 1;
      continue;
    }

    const parsed = parseTag(rawTag);

    if (!parsed) {
      result += rawTag.replace(/</g, '&lt;');
      i = end + 1;
      continue;
    }

    // Strip all mode
    if (stripAll) {
      i = end + 1;
      continue;
    }

    // Dangerously blocked tags (always strip)
    const DANGEROUS_TAGS = new Set(['script', 'style', 'iframe', 'frame', 'frameset', 'object', 'embed', 'applet', 'form', 'input', 'button', 'textarea', 'select', 'option', 'base', 'link', 'meta', 'noscript', 'html', 'head', 'body']);

    if (DANGEROUS_TAGS.has(parsed.tagName)) {
      // Skip the entire tag
      i = end + 1;
      continue;
    }

    if (!allowedTags.has(parsed.tagName)) {
      // Unknown tag - strip
      i = end + 1;
      continue;
    }

    if (parsed.isClosing) {
      result += `</${parsed.tagName}>`;
    } else {
      let attrStr = '';
      for (const [name, value] of parsed.attrs.entries()) {
        if (!allowedAttrs.has(name)) continue;
        if (!isSafeAttrValue(name, value)) continue;
        attrStr += ` ${name}="${value.replace(/"/g, '&quot;')}"`;
      }
      result += `<${parsed.tagName}${attrStr}${parsed.isSelfClosing ? ' /' : ''}>`;
    }

    i = end + 1;
  }

  return result;
}

/**
 * Escape HTML special characters to prevent any HTML injection.
 * Use this for plain text content that must never be parsed as HTML.
 * @param {string} str
 * @returns {string}
 */
export function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

/**
 * Strip all HTML tags, returning only the text content.
 * @param {string} html
 * @returns {string}
 */
export function stripTags(html) {
  return sanitize(html, { stripAllTags: true });
}
