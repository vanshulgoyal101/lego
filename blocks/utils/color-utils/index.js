/**
 * Color Utilities
 * Provides conversion between HEX, RGB, and HSL color formats,
 * plus lightening/darkening helpers. All functions are pure and stateless.
 */

/**
 * @typedef {{ r: number, g: number, b: number }} RGB
 * @typedef {{ h: number, s: number, l: number }} HSL
 */

/**
 * Validates whether a string is a valid CSS hex color.
 * Accepts 3-digit (#rgb), 4-digit (#rgba), 6-digit (#rrggbb),
 * and 8-digit (#rrggbbaa) forms, with or without the '#' prefix.
 *
 * @param {string} hex - The string to validate.
 * @returns {boolean} True if the string is a valid hex color.
 * @example
 * isValidHex('#ff0000'); // true
 * isValidHex('#f00');    // true
 * isValidHex('gg0000'); // false
 */
export function isValidHex(hex) {
  if (typeof hex !== 'string') return false;
  return /^#?([0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(hex.trim());
}

/**
 * Expands a 3 or 4-digit hex to full 6 or 8-digit form.
 * Returns the input unchanged if already 6 or 8 digits.
 *
 * @param {string} hex - Raw hex string (with or without '#').
 * @returns {string} Full hex string (without '#').
 */
function expandHex(hex) {
  const h = hex.startsWith('#') ? hex.slice(1) : hex;
  if (h.length === 3) return h.split('').map(c => c + c).join('');
  if (h.length === 4) return h.split('').map(c => c + c).join('');
  return h;
}

/**
 * Converts a CSS hex color string to an RGB object.
 *
 * @param {string} hex - A valid hex color string (e.g. '#ff0000', '#f00', 'ff0000').
 * @returns {RGB} Object with `r`, `g`, `b` properties in range [0, 255].
 * @throws {Error} If the hex string is invalid.
 * @example
 * hexToRgb('#ff8800'); // { r: 255, g: 136, b: 0 }
 */
export function hexToRgb(hex) {
  if (!isValidHex(hex)) throw new Error(`Invalid hex color: "${hex}"`);
  const full = expandHex(hex);
  return {
    r: parseInt(full.slice(0, 2), 16),
    g: parseInt(full.slice(2, 4), 16),
    b: parseInt(full.slice(4, 6), 16)
  };
}

/**
 * Converts RGB components to a CSS hex color string.
 *
 * @param {number} r - Red channel [0, 255].
 * @param {number} g - Green channel [0, 255].
 * @param {number} b - Blue channel [0, 255].
 * @returns {string} Hex color string including '#' prefix, e.g. '#ff8800'.
 * @throws {Error} If any channel is outside [0, 255].
 * @example
 * rgbToHex(255, 136, 0); // '#ff8800'
 */
export function rgbToHex(r, g, b) {
  for (const [ch, val] of [['r', r], ['g', g], ['b', b]]) {
    if (!Number.isInteger(val) || val < 0 || val > 255) {
      throw new Error(`Channel '${ch}' must be an integer in [0, 255], got ${val}`);
    }
  }
  return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
}

/**
 * Converts RGB to HSL.
 *
 * @param {number} r - Red [0, 255].
 * @param {number} g - Green [0, 255].
 * @param {number} b - Blue [0, 255].
 * @returns {HSL} Object with `h` (degrees [0, 360)), `s` (% [0, 100]), `l` (% [0, 100]).
 */
function rgbToHslRaw(r, g, b) {
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
  const delta = max - min;
  let h = 0, s = 0;
  const l = (max + min) / 2;

  if (delta !== 0) {
    s = delta / (1 - Math.abs(2 * l - 1));
    switch (max) {
      case rn: h = ((gn - bn) / delta % 6 + 6) % 6; break;
      case gn: h = (bn - rn) / delta + 2; break;
      case bn: h = (rn - gn) / delta + 4; break;
    }
    h *= 60;
  }

  return {
    h: Math.round(h),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
}

/**
 * Converts a CSS hex color to an HSL object.
 *
 * @param {string} hex - A valid hex color string.
 * @returns {HSL} Object with `h` (0–359), `s` (0–100), `l` (0–100).
 * @example
 * hexToHsl('#ff0000'); // { h: 0, s: 100, l: 50 }
 */
export function hexToHsl(hex) {
  const { r, g, b } = hexToRgb(hex);
  return rgbToHslRaw(r, g, b);
}

/**
 * Converts an HSL value to a hex color string.
 *
 * @param {number} h - Hue [0, 360].
 * @param {number} s - Saturation [0, 100].
 * @param {number} l - Lightness [0, 100].
 * @returns {string} Hex color string.
 */
function hslToHex(h, s, l) {
  const sn = s / 100, ln = l / 100;
  const c = (1 - Math.abs(2 * ln - 1)) * sn;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = ln - c / 2;
  let r = 0, g = 0, b = 0;

  if (h < 60)       { r = c; g = x; }
  else if (h < 120) { r = x; g = c; }
  else if (h < 180) { g = c; b = x; }
  else if (h < 240) { g = x; b = c; }
  else if (h < 300) { r = x; b = c; }
  else              { r = c; b = x; }

  return rgbToHex(
    Math.round((r + m) * 255),
    Math.round((g + m) * 255),
    Math.round((b + m) * 255)
  );
}

/**
 * Lightens a hex color by increasing its HSL lightness.
 *
 * @param {string} hex - Base hex color string.
 * @param {number} amount - Percentage points to add to lightness (0–100).
 * @returns {string} New lightened hex color.
 * @example
 * lighten('#336699', 10); // ~'#4d80b3'
 */
export function lighten(hex, amount) {
  const { h, s, l } = hexToHsl(hex);
  return hslToHex(h, s, Math.min(100, l + amount));
}

/**
 * Darkens a hex color by decreasing its HSL lightness.
 *
 * @param {string} hex - Base hex color string.
 * @param {number} amount - Percentage points to subtract from lightness (0–100).
 * @returns {string} New darkened hex color.
 * @example
 * darken('#336699', 10); // ~'#1a4d80'
 */
export function darken(hex, amount) {
  const { h, s, l } = hexToHsl(hex);
  return hslToHex(h, s, Math.max(0, l - amount));
}

/**
 * Mixes two hex colors together by averaging their RGB channels.
 *
 * @param {string} hex1 - First hex color.
 * @param {string} hex2 - Second hex color.
 * @param {number} [weight=0.5] - Mix weight toward hex2 (0 = all hex1, 1 = all hex2).
 * @returns {string} Mixed hex color.
 */
export function mix(hex1, hex2, weight = 0.5) {
  const c1 = hexToRgb(hex1);
  const c2 = hexToRgb(hex2);
  const w = Math.max(0, Math.min(1, weight));
  return rgbToHex(
    Math.round(c1.r + (c2.r - c1.r) * w),
    Math.round(c1.g + (c2.g - c1.g) * w),
    Math.round(c1.b + (c2.b - c1.b) * w)
  );
}
