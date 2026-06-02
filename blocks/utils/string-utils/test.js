import { describe, it, expect } from '../../../test/test-harness.js';
import {
  camelCase, pascalCase, snakeCase, kebabCase, constantCase,
  truncate, padStart, padEnd, capitalize, countOccurrences
} from './index.js';

await describe('utils/string-utils', async () => {
  // --- Case conversion ---
  await it('camelCase should handle space-separated words', () => {
    expect(camelCase('hello world')).toBe('helloWorld');
  });

  await it('camelCase should handle kebab-case input', () => {
    expect(camelCase('foo-bar-baz')).toBe('fooBarBaz');
  });

  await it('camelCase should handle snake_case input', () => {
    expect(camelCase('foo_bar_baz')).toBe('fooBarBaz');
  });

  await it('camelCase should handle PascalCase input', () => {
    expect(camelCase('MyPascalCase')).toBe('myPascalCase');
  });

  await it('camelCase should return empty string for empty input', () => {
    expect(camelCase('')).toBe('');
  });

  await it('pascalCase should capitalise every word', () => {
    expect(pascalCase('hello world')).toBe('HelloWorld');
    expect(pascalCase('foo-bar')).toBe('FooBar');
    expect(pascalCase('my_component')).toBe('MyComponent');
  });

  await it('snakeCase should join words with underscores', () => {
    expect(snakeCase('Hello World')).toBe('hello_world');
    expect(snakeCase('fooBarBaz')).toBe('foo_bar_baz');
    expect(snakeCase('foo-bar')).toBe('foo_bar');
  });

  await it('kebabCase should join words with hyphens', () => {
    expect(kebabCase('Hello World')).toBe('hello-world');
    expect(kebabCase('fooBarBaz')).toBe('foo-bar-baz');
    expect(kebabCase('foo_bar')).toBe('foo-bar');
  });

  await it('constantCase should return SCREAMING_SNAKE_CASE', () => {
    expect(constantCase('hello world')).toBe('HELLO_WORLD');
    expect(constantCase('fooBarBaz')).toBe('FOO_BAR_BAZ');
  });

  // --- Truncate ---
  await it('truncate should not truncate when string is within length', () => {
    expect(truncate('Hello', 10)).toBe('Hello');
  });

  await it('truncate should truncate and append default ellipsis', () => {
    const result = truncate('Hello, World!', 8);
    expect(result.length).toBe(8);
    expect(result.endsWith('…')).toBe(true);
  });

  await it('truncate should use custom suffix', () => {
    const result = truncate('Hello, World!', 8, '...');
    expect(result.endsWith('...')).toBe(true);
    expect(result.length).toBe(8);
  });

  await it('truncate should handle length shorter than suffix', () => {
    const result = truncate('Hello, World!', 2, '...');
    // When maxLength < suffix length, we get an empty string (trimLen = 0)
    expect(result.length <= 2).toBe(true);
  });

  await it('truncate should throw on non-string input', () => {
    expect(() => truncate(123, 5)).toThrow('string');
  });

  // --- Padding ---
  await it('padStart should pad from the left', () => {
    expect(padStart('5', 3, '0')).toBe('005');
    expect(padStart('hello', 8)).toBe('   hello');
  });

  await it('padStart should not truncate strings longer than length', () => {
    expect(padStart('hello', 3)).toBe('hello');
  });

  await it('padEnd should pad from the right', () => {
    expect(padEnd('hello', 8, '.')).toBe('hello...');
    expect(padEnd('hi', 5)).toBe('hi   ');
  });

  await it('padEnd should not truncate strings longer than length', () => {
    expect(padEnd('hello', 3)).toBe('hello');
  });

  // --- Capitalize ---
  await it('capitalize should capitalise first letter and lowercase rest', () => {
    expect(capitalize('hELLO')).toBe('Hello');
    expect(capitalize('WORLD')).toBe('World');
  });

  await it('capitalize should handle empty string', () => {
    expect(capitalize('')).toBe('');
  });

  // --- Count Occurrences ---
  await it('countOccurrences should count non-overlapping matches', () => {
    expect(countOccurrences('banana', 'an')).toBe(2);
    expect(countOccurrences('aaaa', 'aa')).toBe(2);
  });

  await it('countOccurrences should return 0 for no matches', () => {
    expect(countOccurrences('hello', 'z')).toBe(0);
  });

  await it('countOccurrences should return 0 for empty needle', () => {
    expect(countOccurrences('hello', '')).toBe(0);
  });

  await it('countOccurrences should throw on non-string arguments', () => {
    expect(() => countOccurrences(123, 'a')).toThrow('strings');
  });
});
