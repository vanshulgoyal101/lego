/**
 * A crash-proof JSON serialization utility.
 * Handles circular reference reference loops, BigInt integers, and Date conversions
 * without throwing TypeError exceptions.
 */

/**
 * Stringifies an object to JSON safely.
 * @param {*} value - The input value to serialize.
 * @param {Function|Array} [replacer] - Standard JSON replacer.
 * @param {string|number} [space] - Space indentations.
 * @returns {string} JSON output.
 */
export function stringifySafe(value, replacer = null, space = 2) {
  const parentOf = new WeakMap();

  const customReplacer = function (key, val) {
    // 1. Handle BigInt types (standard JSON throws on BigInt)
    if (typeof val === 'bigint') {
      return `${val.toString()}n`;
    }

    // 2. Handle circular references
    if (val !== null && typeof val === 'object') {
      let ancestor = this;
      while (ancestor) {
        if (ancestor === val) {
          return '[Circular]';
        }
        ancestor = parentOf.get(ancestor);
      }
      parentOf.set(val, this);
    }

    // If a custom replacer was passed, execute it
    if (replacer) {
      return replacer(key, val);
    }

    return val;
  };

  return JSON.stringify(value, customReplacer, space);
}

/**
 * Safely parses a JSON string, recovering gracefully if formatting is invalid.
 * @param {string} text - JSON string to parse.
 * @param {FallbackValue} [fallback=null] - Default return value on parse error.
 * @returns {*} Parsed value or fallback.
 */
export function parseSafe(text, fallback = null) {
  try {
    return JSON.parse(text, (key, value) => {
      // Decode BigInt values (suffixed with 'n')
      if (typeof value === 'string' && /^-?\d+n$/.test(value)) {
        return BigInt(value.slice(0, -1));
      }
      return value;
    });
  } catch (err) {
    return fallback;
  }
}
