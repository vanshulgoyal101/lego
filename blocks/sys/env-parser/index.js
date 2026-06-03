/**
 * .env File Parser.
 */

function unescapeValue(val) {
  return val
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\r')
    .replace(/\\t/g, '\t')
    .replace(/\\"/g, '"')
    .replace(/\\'/g, "'")
    .replace(/\\\\/g, '\\');
}

/**
 * Parses a .env file string into a key-value object.
 *
 * @param {string} envStr - The .env file contents
 * @returns {Record<string, string>} Parsed configuration object
 */
export function parse(envStr) {
  if (typeof envStr !== 'string') {
    throw new Error('InvalidInput: Input must be a string');
  }

  const result = {};
  const lines = envStr.split(/\r?\n/);

  let currentKey = null;
  let currentValue = null;
  let quoteChar = null; // '"' or "'" or null

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (quoteChar !== null) {
      // Inside a multiline quoted string
      const closingIdx = line.indexOf(quoteChar);
      if (closingIdx !== -1) {
        currentValue += '\n' + line.substring(0, closingIdx);
        result[currentKey] = unescapeValue(currentValue);
        currentKey = null;
        currentValue = null;
        quoteChar = null;
      } else {
        currentValue += '\n' + line;
      }
      continue;
    }

    const trimmed = line.trim();
    // Skip empty lines and comments
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    const eqIdx = line.indexOf('=');
    if (eqIdx === -1) {
      continue;
    }

    const key = line.substring(0, eqIdx).trim();
    let val = line.substring(eqIdx + 1).trim();

    if (val.startsWith('"') || val.startsWith("'")) {
      const q = val[0];
      const endIdx = val.indexOf(q, 1);
      if (endIdx !== -1) {
        // Complete single-line quoted string
        result[key] = unescapeValue(val.substring(1, endIdx));
      } else {
        // Start of multiline string
        currentKey = key;
        currentValue = val.substring(1);
        quoteChar = q;
      }
    } else {
      // Unquoted. Remove inline comment if present
      const commentIdx = val.indexOf('#');
      if (commentIdx !== -1) {
        val = val.substring(0, commentIdx).trim();
      }
      result[key] = val;
    }
  }

  return result;
}

export default {
  parse
};
