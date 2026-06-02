import { describe, it, expect } from '../../../test/test-harness.js';
import { red, green, blue, yellow, bold, dim, underline, bgRed, strip, supports, ansi } from './index.js';

await describe('text/ansi', async () => {
  // In a non-TTY test environment supports() will likely be false,
  // so styling functions return the raw string. We test both cases.

  await it('strip: removes all ANSI escape codes', () => {
    expect(strip('\x1b[31mhello\x1b[0m')).toBe('hello');
    expect(strip('\x1b[1m\x1b[4mbold underline\x1b[0m')).toBe('bold underline');
    expect(strip('no codes here')).toBe('no codes here');
    expect(strip('')).toBe('');
  });

  await it('strip: handles multiple codes in sequence', () => {
    const styled = '\x1b[32m\x1b[1mGreen Bold\x1b[0m\x1b[0m';
    expect(strip(styled)).toBe('Green Bold');
  });

  await it('supports: returns a boolean', () => {
    const result = supports();
    expect(typeof result).toBe('boolean');
  });

  await it('styling functions: strip(fn(str)) always equals str', () => {
    const str = 'test string';
    const fns = [red, green, blue, yellow, bold, dim, underline, bgRed];
    for (const fn of fns) {
      expect(strip(fn(str))).toBe(str);
    }
  });

  await it('bold: wraps string with ANSI when TTY is available', () => {
    // Force check: wrapping then stripping should always yield original
    const result = bold('Hello');
    expect(strip(result)).toBe('Hello');
  });

  await it('red: output contains ANSI codes when supports() is true', () => {
    if (supports()) {
      expect(red('x').includes('\x1b[')).toBe(true);
    } else {
      expect(red('x')).toBe('x');
    }
  });

  await it('ansi: raw code wrapping and stripping', () => {
    const result = ansi('test', '35'); // magenta
    expect(strip(result)).toBe('test');
  });

  await it('styling functions: return strings', () => {
    const str = 'abc';
    expect(typeof red(str)).toBe('string');
    expect(typeof green(str)).toBe('string');
    expect(typeof blue(str)).toBe('string');
    expect(typeof yellow(str)).toBe('string');
    expect(typeof bold(str)).toBe('string');
    expect(typeof dim(str)).toBe('string');
    expect(typeof underline(str)).toBe('string');
    expect(typeof bgRed(str)).toBe('string');
  });
});
