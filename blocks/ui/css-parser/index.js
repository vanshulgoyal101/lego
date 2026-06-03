/**
 * Lightweight CSS stylesheet parser.
 */

/**
 * Parses a CSS stylesheet string into a structured representation.
 *
 * @param {string} css - The CSS stylesheet string
 * @returns {Array<{ selectors: string[], declarations: Record<string, string> }>} Array of rules
 */
export function parse(css) {
  if (typeof css !== 'string') {
    throw new Error('InvalidInput: CSS must be a string');
  }

  // 1. Remove comments
  const cleanCss = css.replace(/\/\*[\s\S]*?\*\//g, '');

  const rules = [];
  let index = 0;
  const len = cleanCss.length;

  while (index < len) {
    // Skip whitespace
    while (index < len && /\s/.test(cleanCss[index])) {
      index++;
    }

    if (index >= len) break;

    // Find selector block boundary '{'
    const openBrace = cleanCss.indexOf('{', index);
    if (openBrace === -1) {
      // Any remaining text without brace is ignored or indicates EOF
      break;
    }

    const selectorStr = cleanCss.substring(index, openBrace).trim();
    if (!selectorStr) {
      index = openBrace + 1;
      continue;
    }

    // Find declaration block boundary '}'
    const closeBrace = cleanCss.indexOf('}', openBrace);
    if (closeBrace === -1) {
      // Unclosed block - parse up to EOF
      break;
    }

    const bodyStr = cleanCss.substring(openBrace + 1, closeBrace).trim();

    // Parse selectors (comma separated)
    const selectors = selectorStr.split(',').map(s => s.trim()).filter(Boolean);

    // Parse declarations
    const declarations = {};
    const decs = bodyStr.split(';');
    for (const dec of decs) {
      const parts = dec.split(':');
      if (parts.length >= 2) {
        const prop = parts[0].trim().toLowerCase();
        // The value could contain colons (e.g. url('http://...')) so join the rest
        const val = parts.slice(1).join(':').trim();
        if (prop && val) {
          declarations[prop] = val;
        }
      }
    }

    rules.push({ selectors, declarations });
    index = closeBrace + 1;
  }

  return rules;
}

/**
 * Stringifies parsed CSS rules back into CSS format.
 *
 * @param {Array<{ selectors: string[], declarations: Record<string, string> }>} rules
 * @returns {string} CSS formatted string
 */
export function stringify(rules) {
  if (!Array.isArray(rules)) {
    throw new Error('InvalidInput: rules must be an array');
  }

  return rules
    .map(rule => {
      const selectors = rule.selectors.join(', ');
      const decs = Object.entries(rule.declarations)
        .map(([prop, val]) => `  ${prop}: ${val};`)
        .join('\n');
      return `${selectors} {\n${decs}\n}`;
    })
    .join('\n\n');
}

export default {
  parse,
  stringify
};
