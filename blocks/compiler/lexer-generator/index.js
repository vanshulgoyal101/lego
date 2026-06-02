export class Lexer {
  /**
   * @param {Array<Object>} rules - [{ type: 'NUMBER', regex: /^[0-9]+/ }, ...]
   */
  constructor(rules) {
    this.rules = rules.map(rule => {
      let source = rule.regex.source;
      // Ensure regex anchors at the start of matches only
      if (!source.startsWith('^')) {
        source = '^' + source;
      }
      return {
        type: rule.type,
        regex: new RegExp(source, rule.regex.flags)
      };
    });
  }

  /**
   * Tokenize input text string
   *
   * @param {string} text
   * @returns {Array<Object>} Array of token objects: { type, value, line, column }
   */
  tokenize(text) {
    const tokens = [];
    let position = 0;
    let line = 1;
    let column = 1;

    while (position < text.length) {
      const chunk = text.slice(position);
      let matched = false;

      for (const rule of this.rules) {
        const match = rule.regex.exec(chunk);
        if (match) {
          const value = match[0];
          
          // Skip tokens labeled as ignored/skipped (e.g. whitespace)
          if (rule.type !== null) {
            tokens.push({
              type: rule.type,
              value,
              line,
              column
            });
          }

          // Advance position and count lines/columns
          position += value.length;
          for (let i = 0; i < value.length; i++) {
            if (value[i] === '\n') {
              line++;
              column = 1;
            } else {
              column++;
            }
          }

          matched = true;
          break;
        }
      }

      if (!matched) {
        throw new Error(`Lexical error: Unexpected character "${text[position]}" at line ${line}, column ${column}`);
      }
    }

    return tokens;
  }
}
