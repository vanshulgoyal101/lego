import { describe, it, expect } from '../../../test/test-harness.js';
import { slugify, isSlug } from './index.js';

await describe('utils/slugify', async () => {
  await it('should convert basic strings to slugs', () => {
    expect(slugify('Hello World')).toBe('hello-world');
  });

  await it('should handle multiple spaces and trim separators', () => {
    expect(slugify('  Hello   World  ')).toBe('hello-world');
  });

  await it('should strip accented characters', () => {
    expect(slugify('café au lait')).toBe('cafe-au-lait');
    expect(slugify('Héllo Wörld')).toBe('hello-world');
  });

  await it('should replace & with "and"', () => {
    expect(slugify('foo & bar')).toBe('foo-and-bar');
  });

  await it('should use custom separator', () => {
    expect(slugify('Hello World', { separator: '_' })).toBe('hello_world');
  });

  await it('should preserve uppercase when lowercase is false', () => {
    expect(slugify('Hello World', { lowercase: false })).toBe('Hello-World');
  });

  await it('should respect maxLength', () => {
    const result = slugify('Hello World', { maxLength: 7 });
    expect(result.length <= 7).toBe(true);
  });

  await it('should handle strict mode', () => {
    const result = slugify('Hello! World?', { strict: true });
    expect(result).toBe('hello-world');
  });

  await it('should handle empty string', () => {
    expect(slugify('')).toBe('');
  });

  await it('should handle strings with only special characters', () => {
    const result = slugify('!@#$%');
    // Should produce empty or stripped result
    expect(typeof result).toBe('string');
  });

  await it('should handle consecutive separators', () => {
    expect(slugify('a---b___c')).toBe('a-b-c');
  });

  await it('should throw on non-string input', () => {
    expect(() => slugify(123)).toThrow('string');
  });

  await it('isSlug should return true for valid slugs', () => {
    expect(isSlug('hello-world')).toBe(true);
    expect(isSlug('foo123')).toBe(true);
    expect(isSlug('a')).toBe(true);
  });

  await it('isSlug should return false for invalid slugs', () => {
    expect(isSlug('Hello World')).toBe(false);
    expect(isSlug('-starts-with-dash')).toBe(false);
    expect(isSlug('')).toBe(false);
    expect(isSlug('has spaces')).toBe(false);
  });
});
