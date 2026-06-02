/**
 * A utility for converting between color formats (HEX, RGB, HSL)
 * and calculating accessibility contrast ratios based on W3C relative luminance equations.
 */

/**
 * Converts HEX color to RGB object.
 * @param {string} hex - Color code (e.g. "#fff", "333333").
 * @returns {{ r: number, g: number, b: number }|null}
 */
export function hexToRgb(hex) {
  const cleanHex = hex.replace(/^#/, '');
  if (cleanHex.length !== 3 && cleanHex.length !== 6) {
    return null;
  }

  let r, g, b;
  if (cleanHex.length === 3) {
    r = parseInt(cleanHex[0] + cleanHex[0], 16);
    g = parseInt(cleanHex[1] + cleanHex[1], 16);
    b = parseInt(cleanHex[2] + cleanHex[2], 16);
  } else {
    r = parseInt(cleanHex.substring(0, 2), 16);
    g = parseInt(cleanHex.substring(2, 4), 16);
    b = parseInt(cleanHex.substring(4, 6), 16);
  }

  return { r, g, b };
}

/**
 * Converts RGB components to HEX string.
 * @param {number} r
 * @param {number} g
 * @param {number} b
 * @returns {string} Hex representation (e.g. "#ffffff").
 */
export function rgbToHex(r, g, b) {
  const toHex = (c) => Math.max(0, Math.min(255, Math.round(c))).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Converts RGB components to HSL.
 * @returns {{ h: number, s: number, l: number }}
 */
export function rgbToHsl(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
}

/**
 * Calculates WCAG relative luminance for a color.
 * Formula: https://www.w3.org/TR/WCAG20/#relativeluminancedef
 */
export function getLuminance(r, g, b) {
  const a = [r, g, b].map(v => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

/**
 * Calculate the contrast ratio between two colors (RGB objects or Hex strings).
 * @param {string|{r:number,g:number,b:number}} color1
 * @param {string|{r:number,g:number,b:number}} color2
 * @returns {number} Contrast ratio (1 to 21).
 */
export function getContrastRatio(color1, color2) {
  const rgb1 = typeof color1 === 'string' ? hexToRgb(color1) : color1;
  const rgb2 = typeof color2 === 'string' ? hexToRgb(color2) : color2;

  if (!rgb1 || !rgb2) {
    throw new Error('Invalid color arguments');
  }

  const l1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const l2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);

  const brightest = Math.max(l1, l2);
  const darkest = Math.min(l1, l2);

  return (brightest + 0.05) / (darkest + 0.05);
}
