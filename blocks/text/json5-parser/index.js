/**
 * JSON5 Parser and Serializer
 * Parses JSON5 superset including: comments, trailing commas, single-quoted strings,
 * unquoted keys, hexadecimal numbers, Infinity, NaN, multiline strings.
 */

// =================== TOKENIZER ====================

const TokenType = {
  LBRACE: 'LBRACE', RBRACE: 'RBRACE',
  LBRACKET: 'LBRACKET', RBRACKET: 'RBRACKET',
  COLON: 'COLON', COMMA: 'COMMA',
  STRING: 'STRING', NUMBER: 'NUMBER',
  BOOLEAN: 'BOOLEAN', NULL: 'NULL',
  IDENTIFIER: 'IDENTIFIER', EOF: 'EOF'
};

function tokenize(src) {
  const tokens = [];
  let i = 0;
  const len = src.length;

  function peek(offset = 0) { return src[i + offset]; }
  function consume() { return src[i++]; }

  while (i < len) {
    // Skip whitespace
    if (/\s/.test(peek())) { i++; continue; }

    // Line comment
    if (peek() === '/' && peek(1) === '/') {
      while (i < len && peek() !== '\n') i++;
      continue;
    }

    // Block comment
    if (peek() === '/' && peek(1) === '*') {
      i += 2;
      while (i < len && !(peek() === '*' && peek(1) === '/')) i++;
      i += 2;
      continue;
    }

    const ch = peek();

    if (ch === '{') { tokens.push({ type: TokenType.LBRACE }); i++; continue; }
    if (ch === '}') { tokens.push({ type: TokenType.RBRACE }); i++; continue; }
    if (ch === '[') { tokens.push({ type: TokenType.LBRACKET }); i++; continue; }
    if (ch === ']') { tokens.push({ type: TokenType.RBRACKET }); i++; continue; }
    if (ch === ':') { tokens.push({ type: TokenType.COLON }); i++; continue; }
    if (ch === ',') { tokens.push({ type: TokenType.COMMA }); i++; continue; }

    // String (single or double quote)
    if (ch === '"' || ch === "'") {
      const quote = consume();
      let str = '';
      while (i < len) {
        const c = consume();
        if (c === '\\') {
          const esc = consume();
          switch (esc) {
            case '"': str += '"'; break;
            case "'": str += "'"; break;
            case '\\': str += '\\'; break;
            case '/': str += '/'; break;
            case 'n': str += '\n'; break;
            case 'r': str += '\r'; break;
            case 't': str += '\t'; break;
            case 'b': str += '\b'; break;
            case 'f': str += '\f'; break;
            case 'u': {
              const hex = src.slice(i, i + 4);
              i += 4;
              str += String.fromCharCode(parseInt(hex, 16));
              break;
            }
            case '\n': case '\r': break; // line continuation
            default: str += esc;
          }
        } else if (c === quote) {
          break;
        } else {
          str += c;
        }
      }
      tokens.push({ type: TokenType.STRING, value: str });
      continue;
    }

    // Numbers (hex, decimal, +/-Infinity, NaN, leading .)
    if (ch === '-' || ch === '+' || ch === '.' || /[0-9]/.test(ch)) {
      let numStr = '';
      if (peek() === '+' || peek() === '-') numStr += consume();

      // Check for Infinity / NaN after sign
      if (src.slice(i, i + 8) === 'Infinity') {
        i += 8;
        tokens.push({ type: TokenType.NUMBER, value: numStr === '-' ? -Infinity : Infinity });
        continue;
      }
      if (src.slice(i, i + 3) === 'NaN') {
        i += 3;
        tokens.push({ type: TokenType.NUMBER, value: NaN });
        continue;
      }

      // Hex
      if (peek() === '0' && (peek(1) === 'x' || peek(1) === 'X')) {
        numStr += consume(); numStr += consume();
        while (i < len && /[0-9a-fA-F]/.test(peek())) numStr += consume();
        tokens.push({ type: TokenType.NUMBER, value: parseInt(numStr, 16) });
        continue;
      }

      // Regular numeric
      while (i < len && /[0-9]/.test(peek())) numStr += consume();
      if (i < len && peek() === '.') { numStr += consume(); while (i < len && /[0-9]/.test(peek())) numStr += consume(); }
      if (i < len && (peek() === 'e' || peek() === 'E')) {
        numStr += consume();
        if (peek() === '+' || peek() === '-') numStr += consume();
        while (i < len && /[0-9]/.test(peek())) numStr += consume();
      }
      tokens.push({ type: TokenType.NUMBER, value: parseFloat(numStr) });
      continue;
    }

    // Identifiers: true, false, null, Infinity, NaN, or unquoted keys
    if (/[a-zA-Z_$]/.test(ch)) {
      let id = '';
      while (i < len && /[a-zA-Z0-9_$]/.test(peek())) id += consume();
      if (id === 'true') tokens.push({ type: TokenType.BOOLEAN, value: true });
      else if (id === 'false') tokens.push({ type: TokenType.BOOLEAN, value: false });
      else if (id === 'null') tokens.push({ type: TokenType.NULL, value: null });
      else if (id === 'Infinity') tokens.push({ type: TokenType.NUMBER, value: Infinity });
      else if (id === 'NaN') tokens.push({ type: TokenType.NUMBER, value: NaN });
      else tokens.push({ type: TokenType.IDENTIFIER, value: id });
      continue;
    }

    throw new SyntaxError(`JSON5: Unexpected character '${ch}' at position ${i}`);
  }

  tokens.push({ type: TokenType.EOF });
  return tokens;
}

// =================== PARSER ====================

class JSON5Parser {
  constructor(tokens) {
    this.tokens = tokens;
    this.pos = 0;
  }

  peek() { return this.tokens[this.pos]; }
  consume() { return this.tokens[this.pos++]; }

  expect(type) {
    const t = this.consume();
    if (t.type !== type) throw new SyntaxError(`JSON5: Expected ${type}, got ${t.type}`);
    return t;
  }

  parse() {
    const val = this.parseValue();
    if (this.peek().type !== TokenType.EOF) {
      throw new SyntaxError(`JSON5: Unexpected token after value: ${this.peek().type}`);
    }
    return val;
  }

  parseValue() {
    const t = this.peek();
    switch (t.type) {
      case TokenType.LBRACE: return this.parseObject();
      case TokenType.LBRACKET: return this.parseArray();
      case TokenType.STRING: this.consume(); return t.value;
      case TokenType.NUMBER: this.consume(); return t.value;
      case TokenType.BOOLEAN: this.consume(); return t.value;
      case TokenType.NULL: this.consume(); return null;
      default: throw new SyntaxError(`JSON5: Unexpected token type ${t.type}`);
    }
  }

  parseObject() {
    this.expect(TokenType.LBRACE);
    const obj = {};

    while (this.peek().type !== TokenType.RBRACE && this.peek().type !== TokenType.EOF) {
      const keyToken = this.consume();
      let key;
      if (keyToken.type === TokenType.STRING || keyToken.type === TokenType.IDENTIFIER) {
        key = keyToken.value;
      } else {
        throw new SyntaxError(`JSON5: Expected string or identifier as key, got ${keyToken.type}`);
      }
      this.expect(TokenType.COLON);
      obj[key] = this.parseValue();

      if (this.peek().type === TokenType.COMMA) {
        this.consume();
      }
    }

    this.expect(TokenType.RBRACE);
    return obj;
  }

  parseArray() {
    this.expect(TokenType.LBRACKET);
    const arr = [];

    while (this.peek().type !== TokenType.RBRACKET && this.peek().type !== TokenType.EOF) {
      arr.push(this.parseValue());
      if (this.peek().type === TokenType.COMMA) {
        this.consume();
      }
    }

    this.expect(TokenType.RBRACKET);
    return arr;
  }
}

// =================== PUBLIC API ====================

/**
 * Parse a JSON5 string into a JavaScript value.
 * @param {string} src - JSON5 source string.
 * @returns {any} Parsed value.
 */
export function parseJSON5(src) {
  if (typeof src !== 'string') throw new TypeError('parseJSON5 expects a string argument');
  const tokens = tokenize(src);
  const parser = new JSON5Parser(tokens);
  return parser.parse();
}

/**
 * Serialize a JavaScript value to a JSON5 string.
 * @param {any} value - Value to serialize.
 * @param {number} [indent=2] - Indentation size (0 for compact).
 * @returns {string} JSON5 string.
 */
export function stringifyJSON5(value, indent = 2) {
  const pad = (n) => indent > 0 ? ' '.repeat(n * indent) : '';
  const nl = indent > 0 ? '\n' : '';

  function serializeValue(val, depth) {
    if (val === null) return 'null';
    if (val === undefined) return 'undefined';
    if (typeof val === 'boolean') return val.toString();
    if (typeof val === 'number') {
      if (isNaN(val)) return 'NaN';
      if (!isFinite(val)) return val > 0 ? 'Infinity' : '-Infinity';
      return val.toString();
    }
    if (typeof val === 'string') return JSON.stringify(val);
    if (typeof val === 'bigint') return val.toString();

    if (Array.isArray(val)) {
      if (val.length === 0) return '[]';
      const items = val.map(v => `${pad(depth + 1)}${serializeValue(v, depth + 1)}`);
      return `[${nl}${items.join(`,${nl}`)}${nl}${pad(depth)}]`;
    }

    if (typeof val === 'object') {
      const keys = Object.keys(val);
      if (keys.length === 0) return '{}';
      const items = keys.map(k => `${pad(depth + 1)}${k}: ${serializeValue(val[k], depth + 1)}`);
      return `{${nl}${items.join(`,${nl}`)}${nl}${pad(depth)}}`;
    }

    return String(val);
  }

  return serializeValue(value, 0);
}
