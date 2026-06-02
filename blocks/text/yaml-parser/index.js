/**
 * YAML Subset Parser and Serializer
 * Parses YAML 1.2 subset: scalars, mappings, sequences, multiline strings, inline flow.
 * Zero dependencies, works in all JS runtimes.
 */

// =================== UTILITIES ====================

function parseScalar(raw) {
  const s = raw.trim();
  if (s === 'null' || s === '~' || s === '') return null;
  if (s === 'true' || s === 'yes' || s === 'on') return true;
  if (s === 'false' || s === 'no' || s === 'off') return false;
  if (/^-?0x[0-9a-fA-F]+$/.test(s)) return parseInt(s, 16);
  if (/^-?0o[0-7]+$/.test(s)) return parseInt(s.replace('0o', ''), 8);
  if (/^-?[0-9]+$/.test(s)) return parseInt(s, 10);
  if (/^-?[0-9]*\.[0-9]+([eE][+-]?[0-9]+)?$/.test(s)) return parseFloat(s);
  if (s === '.inf' || s === '+.inf') return Infinity;
  if (s === '-.inf') return -Infinity;
  if (s === '.nan') return NaN;

  // Quoted strings
  if ((s.startsWith('"') && s.endsWith('"')) ||
      (s.startsWith("'") && s.endsWith("'"))) {
    return s.slice(1, -1);
  }

  return s;
}

function getIndent(line) {
  let i = 0;
  while (i < line.length && line[i] === ' ') i++;
  return i;
}

// =================== PARSER ====================

class YamlParser {
  constructor(lines) {
    this.lines = lines;
    this.pos = 0;
  }

  peek() {
    while (this.pos < this.lines.length) {
      const line = this.lines[this.pos];
      const trimmed = line.trim();
      if (trimmed === '' || trimmed.startsWith('#')) {
        this.pos++;
        continue;
      }
      return line;
    }
    return null;
  }

  consume() {
    const line = this.lines[this.pos++];
    return line;
  }

  parse(baseIndent = 0) {
    const line = this.peek();
    if (line === null) return null;

    const indent = getIndent(line);
    if (indent < baseIndent) return null;

    const trimmed = line.trim();

    // Sequence start
    if (trimmed.startsWith('- ') || trimmed === '-') {
      return this.parseSequence(indent);
    }

    // Mapping start
    if (trimmed.includes(': ') || trimmed.endsWith(':')) {
      return this.parseMapping(indent);
    }

    // Plain scalar
    this.consume();
    return parseScalar(trimmed);
  }

  parseSequence(baseIndent) {
    const arr = [];
    while (true) {
      const line = this.peek();
      if (line === null) break;
      const indent = getIndent(line);
      if (indent < baseIndent) break;
      const trimmed = line.trim();
      if (!trimmed.startsWith('-')) break;

      this.consume();
      const rest = trimmed.slice(1).trim();

      if (rest === '') {
        // Multi-line value
        const nextLine = this.peek();
        if (nextLine !== null && getIndent(nextLine) > baseIndent) {
          arr.push(this.parse(baseIndent + 2));
        } else {
          arr.push(null);
        }
      } else if (rest.includes(': ') || rest.endsWith(':')) {
        // Inline mapping-like entry - prepend as mapping lines
        const itemLines = [' '.repeat(baseIndent + 2) + rest];
        // Collect subsequent deeper-indented lines
        while (true) {
          const next = this.peek();
          if (next === null || getIndent(next) <= baseIndent) break;
          itemLines.push(this.consume());
        }
        const subParser = new YamlParser(itemLines);
        arr.push(subParser.parse(baseIndent + 2));
      } else {
        arr.push(parseScalar(rest));
      }
    }
    return arr;
  }

  parseMapping(baseIndent) {
    const obj = {};
    while (true) {
      const line = this.peek();
      if (line === null) break;
      const indent = getIndent(line);
      if (indent < baseIndent) break;

      const trimmed = line.trim();
      if (trimmed.startsWith('-')) break; // Sequence sibling
      if (!trimmed.includes(':')) break;

      this.consume();

      const colonIdx = trimmed.indexOf(':');
      const key = trimmed.slice(0, colonIdx).trim();
      const rest = trimmed.slice(colonIdx + 1).trim();

      // Handle block scalar indicators | and >
      if (rest === '|' || rest === '>') {
        const fold = rest === '>';
        const blockLines = [];
        let blockIndent = null;
        while (true) {
          const next = this.peek();
          if (next === null) break;
          if (next.trim() === '') { blockLines.push(''); this.consume(); continue; }
          const nextIndent = getIndent(next);
          if (blockIndent === null) blockIndent = nextIndent;
          if (nextIndent < blockIndent) break;
          blockLines.push(this.consume().slice(blockIndent));
        }
        // Trim trailing empty lines but keep one newline at end
        while (blockLines.length > 0 && blockLines[blockLines.length - 1] === '') blockLines.pop();
        obj[key] = fold
          ? blockLines.join(' ') + '\n'
          : blockLines.join('\n') + '\n';
      } else if (rest === '') {
        // Value is next indented block
        const nextLine = this.peek();
        if (nextLine !== null && getIndent(nextLine) > indent) {
          obj[key] = this.parse(indent + 1);
        } else {
          obj[key] = null;
        }
      } else {
        // Inline value - may be an inline array or scalar
        if (rest.startsWith('[')) {
          obj[key] = parseInlineArray(rest);
        } else if (rest.startsWith('{')) {
          obj[key] = parseInlineMapping(rest);
        } else {
          obj[key] = parseScalar(rest);
        }
      }
    }
    return obj;
  }
}

function parseInlineArray(src) {
  const inner = src.slice(1, src.lastIndexOf(']')).trim();
  if (!inner) return [];
  return inner.split(',').map(s => parseScalar(s.trim()));
}

function parseInlineMapping(src) {
  const inner = src.slice(1, src.lastIndexOf('}')).trim();
  if (!inner) return {};
  const obj = {};
  for (const pair of inner.split(',')) {
    const [k, v] = pair.split(':');
    if (k) obj[k.trim()] = parseScalar((v || '').trim());
  }
  return obj;
}

// =================== PUBLIC API ====================

/**
 * Parse a YAML string into a JavaScript value.
 * @param {string} yaml - YAML source string.
 * @returns {any} Parsed JavaScript value.
 */
export function parseYaml(yaml) {
  if (typeof yaml !== 'string') throw new TypeError('parseYaml expects a string');
  const lines = yaml.split('\n');

  // Handle documents starting with ---
  const startIdx = lines[0].trim() === '---' ? 1 : 0;
  const parser = new YamlParser(lines.slice(startIdx));
  return parser.parse(0);
}

/**
 * Serialize a JavaScript value to a YAML string.
 * @param {any} value - Value to serialize.
 * @param {number} [indent=2] - Indentation level size.
 * @returns {string} YAML string.
 */
export function stringifyYaml(value, indent = 2, depth = 0) {
  const pad = ' '.repeat(depth * indent);
  const childPad = ' '.repeat((depth + 1) * indent);

  if (value === null || value === undefined) return 'null';
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  if (typeof value === 'number') {
    if (isNaN(value)) return '.nan';
    if (!isFinite(value)) return value > 0 ? '.inf' : '-.inf';
    return String(value);
  }
  if (typeof value === 'string') {
    if (/[\n:{}[\],&*#?|<>=!%@`]/.test(value) || value.trim() !== value) {
      return JSON.stringify(value); // Use quoted form for complex strings
    }
    return value;
  }
  if (Array.isArray(value)) {
    if (value.length === 0) return '[]';
    return value.map(item => {
      const serialized = stringifyYaml(item, indent, depth + 1);
      if (typeof item === 'object' && item !== null && !Array.isArray(item)) {
        // Multi-line mapping item
        const lines = serialized.split('\n');
        return `${pad}- ${lines[0].trimStart()}\n${lines.slice(1).join('\n')}`;
      }
      return `${pad}- ${serialized}`;
    }).join('\n');
  }
  if (typeof value === 'object') {
    const keys = Object.keys(value);
    if (keys.length === 0) return '{}';
    return keys.map(key => {
      const v = value[key];
      const serialized = stringifyYaml(v, indent, depth + 1);
      if (typeof v === 'object' && v !== null && (Array.isArray(v) || Object.keys(v).length > 0)) {
        return `${pad}${key}:\n${serialized}`;
      }
      return `${pad}${key}: ${serialized}`;
    }).join('\n');
  }
  return String(value);
}
