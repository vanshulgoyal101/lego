/**
 * Lightweight XML to JSON Parser.
 */

function unescapeXml(str) {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

function parseAttributes(attrStr) {
  const attrs = {};
  const regex = /([a-zA-Z0-9_\-:]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g;
  let match;
  while ((match = regex.exec(attrStr)) !== null) {
    attrs[match[1]] = match[2] !== undefined ? match[2] : (match[3] !== undefined ? match[3] : '');
  }
  return attrs;
}

/**
 * Parses an XML string into a structured AST-like object.
 *
 * @param {string} xml - The XML string
 * @returns {object} Nested AST representation
 */
export function parseAST(xml) {
  if (typeof xml !== 'string') {
    throw new Error('InvalidInput: XML must be a string');
  }

  // Remove comments and declaration
  let cleanXml = xml.replace(/<!--[\s\S]*?-->/g, '');
  cleanXml = cleanXml.replace(/<\?xml[\s\S]*?\?>/g, '').trim();

  const tokens = [];
  let lastIndex = 0;
  const tagRegex = /<(\/)?([a-zA-Z0-9_\-:]+)([^>]*?)(\/?)>/g;
  let match;

  while ((match = tagRegex.exec(cleanXml)) !== null) {
    const textBefore = cleanXml.substring(lastIndex, match.index).trim();
    if (textBefore) {
      tokens.push({ type: 'text', value: unescapeXml(textBefore) });
    }

    const isClose = !!match[1];
    const tagName = match[2];
    const attrStr = match[3];
    const isSelfClosing = !!match[4];

    if (isClose) {
      tokens.push({ type: 'close', name: tagName });
    } else {
      const attributes = parseAttributes(attrStr);
      tokens.push({ type: 'open', name: tagName, attributes, isSelfClosing });
    }
    lastIndex = tagRegex.lastIndex;
  }

  const root = { name: 'root', attributes: {}, children: [], text: '' };
  const stack = [root];

  for (const token of tokens) {
    if (token.type === 'open') {
      const node = {
        name: token.name,
        attributes: token.attributes,
        children: [],
        text: ''
      };
      stack[stack.length - 1].children.push(node);
      if (!token.isSelfClosing) {
        stack.push(node);
      }
    } else if (token.type === 'close') {
      if (stack.length > 1 && stack[stack.length - 1].name === token.name) {
        stack.pop();
      }
    } else if (token.type === 'text') {
      if (stack.length > 1) {
        stack[stack.length - 1].text += token.value;
      }
    }
  }

  return root.children[0] || null;
}

function simplifyNode(node) {
  if (!node) return null;

  if (node.children.length === 0) {
    if (Object.keys(node.attributes).length > 0) {
      return {
        _attributes: node.attributes,
        _text: node.text.trim()
      };
    }
    return node.text.trim();
  }

  const result = {};
  if (Object.keys(node.attributes).length > 0) {
    result._attributes = node.attributes;
  }

  for (const child of node.children) {
    const simplifiedChild = simplifyNode(child);
    if (result[child.name]) {
      if (Array.isArray(result[child.name])) {
        result[child.name].push(simplifiedChild);
      } else {
        result[child.name] = [result[child.name], simplifiedChild];
      }
    } else {
      result[child.name] = simplifiedChild;
    }
  }

  const trimmedText = node.text.trim();
  if (trimmedText) {
    result._text = trimmedText;
  }

  return result;
}

/**
 * Parses an XML string into a simplified JSON object.
 *
 * @param {string} xml - The XML string
 * @returns {object} Simplified JSON representation
 */
export function parse(xml) {
  const ast = parseAST(xml);
  if (!ast) return {};
  return {
    [ast.name]: simplifyNode(ast)
  };
}

export default {
  parseAST,
  parse
};
