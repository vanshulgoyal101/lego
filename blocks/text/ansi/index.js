/**
 * ANSI Escape Code Utilities
 *
 * Provides functions to wrap strings in ANSI color/style escape codes for
 * colorful terminal output, plus a `strip` function to remove all ANSI codes
 * and a `supports` function to detect terminal color support.
 *
 * All styling functions are composable (the output of one can be passed into
 * another). When terminal color is not supported, the raw string is returned.
 */

// ─── ANSI Code Constants ───────────────────────────────────────────────────

const ESC = '\x1b[';

/** @type {Record<string, string>} */
const CODES = {
  reset:          '0',
  bold:           '1',
  dim:            '2',
  underline:      '4',
  blink:          '5',
  reverse:        '7',
  hidden:         '8',
  // Foreground colors
  black:          '30',
  red:            '31',
  green:          '32',
  yellow:         '33',
  blue:           '34',
  magenta:        '35',
  cyan:           '36',
  white:          '37',
  // Background colors
  bgBlack:        '40',
  bgRed:          '41',
  bgGreen:        '42',
  bgYellow:       '43',
  bgBlue:         '44',
  bgMagenta:      '45',
  bgCyan:         '46',
  bgWhite:        '47',
};

const RESET = `${ESC}${CODES.reset}m`;

/**
 * Wrap a string with an ANSI open code and a reset at the end.
 * @param {string} str
 * @param {string} code - ANSI numeric code string
 * @returns {string}
 */
function wrap(str, code) {
  return `${ESC}${code}m${str}${RESET}`;
}

// ─── Terminal Support Detection ────────────────────────────────────────────

/**
 * Detect whether the current terminal likely supports ANSI color codes.
 * Checks the TERM, COLORTERM, and NO_COLOR environment variables.
 *
 * @returns {boolean}
 */
export function supports() {
  // Running in Node.js
  if (typeof process !== 'undefined') {
    if (process.env.NO_COLOR) return false;
    if (process.env.FORCE_COLOR) return true;
    if (process.stdout && !process.stdout.isTTY) return false;
    const term = (process.env.TERM ?? '') + (process.env.COLORTERM ?? '');
    if (/truecolor|24bit|256color|color|xterm|ansi/i.test(term)) return true;
    return process.platform !== 'win32' && !!process.stdout?.isTTY;
  }
  // Non-Node environment — assume no support
  return false;
}

// ─── Foreground Colors ─────────────────────────────────────────────────────

/** @param {string} str @returns {string} */
export const red     = str => supports() ? wrap(str, CODES.red)     : str;
/** @param {string} str @returns {string} */
export const green   = str => supports() ? wrap(str, CODES.green)   : str;
/** @param {string} str @returns {string} */
export const blue    = str => supports() ? wrap(str, CODES.blue)    : str;
/** @param {string} str @returns {string} */
export const yellow  = str => supports() ? wrap(str, CODES.yellow)  : str;
/** @param {string} str @returns {string} */
export const magenta = str => supports() ? wrap(str, CODES.magenta) : str;
/** @param {string} str @returns {string} */
export const cyan    = str => supports() ? wrap(str, CODES.cyan)    : str;
/** @param {string} str @returns {string} */
export const white   = str => supports() ? wrap(str, CODES.white)   : str;
/** @param {string} str @returns {string} */
export const black   = str => supports() ? wrap(str, CODES.black)   : str;

// ─── Background Colors ─────────────────────────────────────────────────────

/** @param {string} str @returns {string} */
export const bgRed     = str => supports() ? wrap(str, CODES.bgRed)     : str;
/** @param {string} str @returns {string} */
export const bgGreen   = str => supports() ? wrap(str, CODES.bgGreen)   : str;
/** @param {string} str @returns {string} */
export const bgBlue    = str => supports() ? wrap(str, CODES.bgBlue)    : str;
/** @param {string} str @returns {string} */
export const bgYellow  = str => supports() ? wrap(str, CODES.bgYellow)  : str;
/** @param {string} str @returns {string} */
export const bgMagenta = str => supports() ? wrap(str, CODES.bgMagenta) : str;
/** @param {string} str @returns {string} */
export const bgCyan    = str => supports() ? wrap(str, CODES.bgCyan)    : str;
/** @param {string} str @returns {string} */
export const bgWhite   = str => supports() ? wrap(str, CODES.bgWhite)   : str;

// ─── Text Styles ───────────────────────────────────────────────────────────

/** @param {string} str @returns {string} */
export const bold      = str => supports() ? wrap(str, CODES.bold)      : str;
/** @param {string} str @returns {string} */
export const dim       = str => supports() ? wrap(str, CODES.dim)       : str;
/** @param {string} str @returns {string} */
export const underline = str => supports() ? wrap(str, CODES.underline) : str;
/** @param {string} str @returns {string} */
export const blink     = str => supports() ? wrap(str, CODES.blink)     : str;
/** @param {string} str @returns {string} */
export const reverse   = str => supports() ? wrap(str, CODES.reverse)   : str;
/** @param {string} str @returns {string} */
export const hidden    = str => supports() ? wrap(str, CODES.hidden)    : str;

// ─── Strip ANSI ────────────────────────────────────────────────────────────

/** Regex that matches all ANSI escape sequences. */
const ANSI_REGEX = /\x1b\[[0-9;]*[a-zA-Z]/g;

/**
 * Remove all ANSI escape codes from a string, returning plain text.
 *
 * @param {string} str - String potentially containing ANSI codes
 * @returns {string}
 * @example strip('\x1b[31mhello\x1b[0m'); // 'hello'
 */
export function strip(str) {
  return str.replace(ANSI_REGEX, '');
}

/**
 * Apply a raw ANSI numeric code directly (advanced use).
 * @param {string} str
 * @param {string|number} code
 * @returns {string}
 */
export function ansi(str, code) {
  return supports() ? wrap(str, String(code)) : str;
}
