export class JsonSanitizer {
  /**
   * Sanitizes a relaxed/malformed JSON string into valid JSON.
   * Handles:
   * - JS single-line and multi-line comments
   * - Single-quoted strings/keys
   * - Unquoted keys
   * - Trailing commas in arrays/objects
   * @param {string} input - Relaxed JSON string
   * @returns {string} Clean valid JSON string
   */
  static sanitize(input) {
    if (typeof input !== 'string') {
      throw new Error('Input must be a string');
    }

    // 1. Remove comments first (outside of strings)
    let clean = this.removeComments(input);

    // 2. State-based tokenizer/sanitizer to fix quotes, unquoted keys, and trailing commas
    let output = '';
    let i = 0;
    const len = clean.length;

    while (i < len) {
      const char = clean[i];

      // Handle String literals
      if (char === '"' || char === "'") {
        const quoteType = char;
        let strVal = '';
        i++; // skip quote

        while (i < len) {
          const c = clean[i];
          if (c === '\\') {
            strVal += c + (clean[i + 1] || '');
            i += 2;
          } else if (c === quoteType) {
            i++; // skip closing quote
            break;
          } else {
            strVal += c;
            i++;
          }
        }

        // Convert string contents to valid double-quoted string
        // Escape existing unescaped double quotes inside
        const escaped = strVal.replace(/"/g, '\\"');
        output += `"${escaped}"`;
        continue;
      }

      // Handle unquoted keys or raw symbols
      if (/[a-zA-Z0-9_$]/.test(char)) {
        let symbol = '';
        while (i < len && /[a-zA-Z0-9_$]/.test(clean[i])) {
          symbol += clean[i];
          i++;
        }

        // Check if this symbol is followed by a colon (i.e. it's an unquoted key)
        let tempIdx = i;
        while (tempIdx < len && /\s/.test(clean[tempIdx])) {
          tempIdx++;
        }

        if (clean[tempIdx] === ':') {
          output += `"${symbol}"`;
        } else {
          // Normal value (like numbers, true, false, null)
          output += symbol;
        }
        continue;
      }

      // Skip whitespace, but preserve structure
      if (/\s/.test(char)) {
        output += char;
        i++;
        continue;
      }

      // Handle brackets/delimiters
      output += char;
      i++;
    }

    // 3. Remove trailing commas in objects/arrays: e.g. ,} or ,]
    output = output.replace(/,\s*([\]}])/g, '$1');

    return output;
  }

  static removeComments(str) {
    let output = '';
    let i = 0;
    const len = str.length;
    let inString = false;
    let quoteType = '';

    while (i < len) {
      const char = str[i];

      if (inString) {
        if (char === '\\') {
          output += char + (str[i + 1] || '');
          i += 2;
        } else if (char === quoteType) {
          inString = false;
          output += char;
          i++;
        } else {
          output += char;
          i++;
        }
        continue;
      }

      if (char === '"' || char === "'") {
        inString = true;
        quoteType = char;
        output += char;
        i++;
        continue;
      }

      // Check for single-line comment //
      if (char === '/' && str[i + 1] === '/') {
        i += 2;
        while (i < len && str[i] !== '\n' && str[i] !== '\r') {
          i++;
        }
        continue;
      }

      // Check for multi-line comment /* */
      if (char === '/' && str[i + 1] === '*') {
        i += 2;
        while (i < len && !(str[i] === '*' && str[i + 1] === '/')) {
          i++;
        }
        i += 2; // skip */
        continue;
      }

      output += char;
      i++;
    }

    return output;
  }
}
