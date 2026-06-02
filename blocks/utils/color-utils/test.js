import { describe, it, expect } from '../../../test/test-harness.js';
import {
  isValidHex, hexToRgb, rgbToHex, hexToHsl, lighten, darken, mix
} from './index.js';

await describe('utils/color-utils', async () => {
  await it('isValidHex should accept valid 6-digit hex', () => {
    expect(isValidHex('#ff0000')).toBe(true);
    expect(isValidHex('#AABBCC')).toBe(true);
    expect(isValidHex('ff0000')).toBe(true); // without #
  });

  await it('isValidHex should accept valid 3-digit shorthand', () => {
    expect(isValidHex('#f00')).toBe(true);
    expect(isValidHex('#abc')).toBe(true);
  });

  await it('isValidHex should reject invalid hex', () => {
    expect(isValidHex('#gg0000')).toBe(false);
    expect(isValidHex('#12345')).toBe(false); // 5 digits
    expect(isValidHex('')).toBe(false);
    expect(isValidHex(null)).toBe(false);
    expect(isValidHex(42)).toBe(false);
  });

  await it('hexToRgb should convert 6-digit hex correctly', () => {
    expect(hexToRgb('#ff0000')).toEqual({ r: 255, g: 0, b: 0 });
    expect(hexToRgb('#00ff00')).toEqual({ r: 0, g: 255, b: 0 });
    expect(hexToRgb('#0000ff')).toEqual({ r: 0, g: 0, b: 255 });
    expect(hexToRgb('#ffffff')).toEqual({ r: 255, g: 255, b: 255 });
    expect(hexToRgb('#000000')).toEqual({ r: 0, g: 0, b: 0 });
  });

  await it('hexToRgb should expand 3-digit hex', () => {
    expect(hexToRgb('#f00')).toEqual({ r: 255, g: 0, b: 0 });
    expect(hexToRgb('#fff')).toEqual({ r: 255, g: 255, b: 255 });
  });

  await it('hexToRgb should throw on invalid hex', () => {
    expect(() => hexToRgb('#xyz')).toThrow('Invalid hex');
  });

  await it('rgbToHex should convert RGB to hex', () => {
    expect(rgbToHex(255, 0, 0)).toBe('#ff0000');
    expect(rgbToHex(0, 255, 0)).toBe('#00ff00');
    expect(rgbToHex(0, 0, 255)).toBe('#0000ff');
    expect(rgbToHex(255, 255, 255)).toBe('#ffffff');
  });

  await it('rgbToHex should throw on out-of-range values', () => {
    expect(() => rgbToHex(256, 0, 0)).toThrow('[0, 255]');
    expect(() => rgbToHex(-1, 0, 0)).toThrow('[0, 255]');
  });

  await it('hexToRgb and rgbToHex should round-trip', () => {
    const hex = '#336699';
    const { r, g, b } = hexToRgb(hex);
    expect(rgbToHex(r, g, b)).toBe(hex);
  });

  await it('hexToHsl should convert red to correct HSL', () => {
    const hsl = hexToHsl('#ff0000');
    expect(hsl.h).toBe(0);
    expect(hsl.s).toBe(100);
    expect(hsl.l).toBe(50);
  });

  await it('hexToHsl should convert white correctly', () => {
    const hsl = hexToHsl('#ffffff');
    expect(hsl.l).toBe(100);
    expect(hsl.s).toBe(0);
  });

  await it('lighten should increase lightness', () => {
    const original = hexToHsl('#336699');
    const lightened = hexToHsl(lighten('#336699', 10));
    expect(lightened.l).toBeGreaterThan(original.l);
  });

  await it('lighten should not exceed 100% lightness', () => {
    const result = hexToHsl(lighten('#ffffff', 20));
    expect(result.l).toBe(100);
  });

  await it('darken should decrease lightness', () => {
    const original = hexToHsl('#336699');
    const darkened = hexToHsl(darken('#336699', 10));
    expect(darkened.l).toBeLessThan(original.l);
  });

  await it('darken should not go below 0% lightness', () => {
    const result = hexToHsl(darken('#000000', 20));
    expect(result.l).toBe(0);
  });

  await it('mix should blend two colors', () => {
    const result = mix('#ff0000', '#0000ff', 0.5);
    const rgb = hexToRgb(result);
    // Midpoint of red and blue should be near (128, 0, 128)
    expect(rgb.r).toBeGreaterThan(100);
    expect(rgb.b).toBeGreaterThan(100);
    expect(rgb.g).toBe(0);
  });

  await it('mix with weight 0 should return first color', () => {
    expect(mix('#ff0000', '#0000ff', 0)).toBe('#ff0000');
  });

  await it('mix with weight 1 should return second color', () => {
    expect(mix('#ff0000', '#0000ff', 1)).toBe('#0000ff');
  });
});
