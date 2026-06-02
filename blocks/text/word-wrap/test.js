import { describe, it, expect } from '../../../test/test-harness.js';
import { wrap, wrapWords, centerText } from './index.js';

await describe('text/word-wrap', async () => {
  await it('wrap: should wrap at word boundaries', () => {
    const result = wrap('The quick brown fox jumps over the lazy dog', 20);
    const lines = result.split('\n');
    // Every line should be <= 20 chars
    expect(lines.every(l => l.length <= 20)).toBe(true);
    // Content should be preserved
    expect(result.replace(/\n/g, ' ')).toBe('The quick brown fox jumps over the lazy dog');
  });

  await it('wrap: should not wrap short text within width', () => {
    const result = wrap('Hello world', 50);
    expect(result).toBe('Hello world');
  });

  await it('wrap: single word fits on one line', () => {
    const result = wrap('Hello', 10);
    expect(result).toBe('Hello');
  });

  await it('wrap: indent option prepends to each line', () => {
    const result = wrap('one two three four five', 15, { indent: '  ' });
    const lines = result.split('\n');
    // Each line starts with indent and total ≤ 15
    expect(lines.every(l => l.startsWith('  '))).toBe(true);
    expect(lines.every(l => l.length <= 15)).toBe(true);
  });

  await it('wrap: cut option hard-cuts words longer than width', () => {
    const result = wrap('superlongwordthatexceedswidth', 10, { cut: true });
    const lines = result.split('\n');
    expect(lines.every(l => l.length <= 10)).toBe(true);
  });

  await it('wrap: preserveNewlines keeps existing line breaks', () => {
    const input = 'line one\nline two\nline three';
    const result = wrap(input, 50, { preserveNewlines: true });
    expect(result.split('\n').length).toBe(3);
  });

  await it('wrap: empty string returns indent or empty', () => {
    const result = wrap('', 20, { indent: '' });
    // Should not throw
    expect(typeof result).toBe('string');
  });

  await it('wrap: throws on zero width', () => {
    expect(() => wrap('hello', 0)).toThrow();
  });

  await it('wrap: throws on non-string input', () => {
    expect(() => wrap(123, 20)).toThrow();
  });

  await it('wrapWords: convenience wrapper works', () => {
    const result = wrapWords('hello world foo bar', 10);
    const lines = result.split('\n');
    expect(lines.every(l => l.length <= 10)).toBe(true);
  });

  await it('centerText: centers a single line', () => {
    const result = centerText('hi', 10);
    expect(result.length).toBe(10);
    expect(result.trim()).toBe('hi');
  });

  await it('centerText: centers multiple lines', () => {
    const result = centerText('hi\nhello', 10);
    const lines = result.split('\n');
    expect(lines.length).toBe(2);
    expect(lines.every(l => l.length === 10)).toBe(true);
    expect(lines[0].trim()).toBe('hi');
    expect(lines[1].trim()).toBe('hello');
  });

  await it('centerText: line longer than width is returned as-is', () => {
    const long = 'this is a very long line';
    const result = centerText(long, 5);
    expect(result).toBe(long);
  });

  await it('centerText: throws on invalid width', () => {
    expect(() => centerText('hi', 0)).toThrow();
  });
});
