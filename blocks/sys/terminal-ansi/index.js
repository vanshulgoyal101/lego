/**
 * ANSI Terminal Styling Utility.
 */

const STYLES = {
  reset: 0,
  bold: 1,
  dim: 2,
  italic: 3,
  underline: 4,
  blink: 5,
  inverse: 7,
  hidden: 8,
  strikethrough: 9
};

const COLORS = {
  black: 30,
  red: 31,
  green: 32,
  yellow: 33,
  blue: 34,
  magenta: 35,
  cyan: 36,
  white: 37,
  gray: 90,
  brightRed: 91,
  brightGreen: 92,
  brightYellow: 93,
  brightBlue: 94,
  brightMagenta: 95,
  brightCyan: 96,
  brightWhite: 97
};

const BG_COLORS = {
  black: 40,
  red: 41,
  green: 42,
  yellow: 43,
  blue: 44,
  magenta: 45,
  cyan: 46,
  white: 47,
  gray: 100,
  brightRed: 101,
  brightGreen: 102,
  brightYellow: 103,
  brightBlue: 104,
  brightMagenta: 105,
  brightCyan: 106,
  brightWhite: 107
};

/**
 * Formats text with ANSI escape sequences.
 *
 * @param {string} text - Text to style
 * @param {object} options - Styling options
 * @param {string} [options.color] - Foreground color
 * @param {string} [options.bg] - Background color
 * @param {boolean} [options.bold] - Bold text
 * @param {boolean} [options.dim] - Dim text
 * @param {boolean} [options.italic] - Italic text
 * @param {boolean} [options.underline] - Underlined text
 * @param {boolean} [options.strikethrough] - Strikethrough text
 * @param {boolean} [options.inverse] - Inverted color text
 * @returns {string} Stylized text
 */
export function style(text, options = {}) {
  const codes = [];

  // Parse styles
  if (options.bold) codes.push(STYLES.bold);
  if (options.dim) codes.push(STYLES.dim);
  if (options.italic) codes.push(STYLES.italic);
  if (options.underline) codes.push(STYLES.underline);
  if (options.strikethrough) codes.push(STYLES.strikethrough);
  if (options.inverse) codes.push(STYLES.inverse);

  // Parse colors
  if (options.color && COLORS[options.color] !== undefined) {
    codes.push(COLORS[options.color]);
  }

  // Parse bg colors
  if (options.bg && BG_COLORS[options.bg] !== undefined) {
    codes.push(BG_COLORS[options.bg]);
  }

  if (codes.length === 0) return text;
  return `\x1B[${codes.join(';')}m${text}\x1B[${STYLES.reset}m`;
}

/**
 * Strips all ANSI escape codes from a string.
 *
 * @param {string} text - Stylized text
 * @returns {string} Plain text
 */
export function strip(text) {
  if (typeof text !== 'string') return '';
  return text.replace(/\x1B\[[0-9;]*[a-zA-Z]/g, '');
}

// Helpers
export const red = (text) => style(text, { color: 'red' });
export const green = (text) => style(text, { color: 'green' });
export const yellow = (text) => style(text, { color: 'yellow' });
export const blue = (text) => style(text, { color: 'blue' });
export const magenta = (text) => style(text, { color: 'magenta' });
export const cyan = (text) => style(text, { color: 'cyan' });
export const bold = (text) => style(text, { bold: true });
export const underline = (text) => style(text, { underline: true });

export default {
  style,
  strip,
  red,
  green,
  yellow,
  blue,
  magenta,
  cyan,
  bold,
  underline
};
