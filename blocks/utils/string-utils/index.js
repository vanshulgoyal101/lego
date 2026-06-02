/**
 * String Utilities
 * Common string manipulation helpers: case conversion, truncation,
 * padding, word splitting, and more. All functions are pure and zero-dependency.
 */

/**
 * Splits a string into an array of words, handling camelCase, PascalCase,
 * snake_case, kebab-case, and whitespace-separated strings.
 *
 * @param {string} str - The input string.
 * @returns {string[]} Array of lowercase word strings.
 */
function toWords(str) {
  if (typeof str !== 'string') return [];
  return str
    // Insert space before upper-case letters in camelCase/PascalCase
    .replace(/([a-z\d])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    // Replace common separators with spaces
    .replace(/[-_]+/g, ' ')
    // Collapse whitespace
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map(w => w.toLowerCase());
}

/**
 * Converts a string to camelCase.
 *
 * @param {string} str - Input string (any case/format).
 * @returns {string} camelCase string.
 * @example
 * camelCase('hello world');    // 'helloWorld'
 * camelCase('foo-bar-baz');    // 'fooBarBaz'
 * camelCase('MyPascalCase');   // 'myPascalCase'
 */
export function camelCase(str) {
  const words = toWords(str);
  if (words.length === 0) return '';
  return words[0] + words.slice(1).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('');
}

/**
 * Converts a string to PascalCase (UpperCamelCase).
 *
 * @param {string} str - Input string.
 * @returns {string} PascalCase string.
 * @example
 * pascalCase('hello world');  // 'HelloWorld'
 * pascalCase('foo-bar');      // 'FooBar'
 */
export function pascalCase(str) {
  return toWords(str).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('');
}

/**
 * Converts a string to snake_case.
 *
 * @param {string} str - Input string.
 * @returns {string} snake_case string.
 * @example
 * snakeCase('Hello World'); // 'hello_world'
 * snakeCase('fooBar');      // 'foo_bar'
 */
export function snakeCase(str) {
  return toWords(str).join('_');
}

/**
 * Converts a string to kebab-case.
 *
 * @param {string} str - Input string.
 * @returns {string} kebab-case string.
 * @example
 * kebabCase('Hello World'); // 'hello-world'
 * kebabCase('fooBar');      // 'foo-bar'
 */
export function kebabCase(str) {
  return toWords(str).join('-');
}

/**
 * Converts a string to SCREAMING_SNAKE_CASE (constant case).
 *
 * @param {string} str - Input string.
 * @returns {string} CONSTANT_CASE string.
 * @example
 * constantCase('Hello World'); // 'HELLO_WORLD'
 */
export function constantCase(str) {
  return toWords(str).join('_').toUpperCase();
}

/**
 * Truncates a string to at most `length` characters, appending `suffix` if
 * truncation occurred. The suffix is counted within the length limit.
 *
 * @param {string} str - Input string.
 * @param {number} length - Maximum total length of the returned string.
 * @param {string} [suffix='…'] - String appended when truncation occurs.
 * @returns {string} Truncated string.
 * @example
 * truncate('Hello, World!', 8);        // 'Hello, …'
 * truncate('Hello, World!', 8, '...'); // 'Hello...'
 * truncate('Hi', 10);                  // 'Hi'
 */
export function truncate(str, length, suffix = '…') {
  if (typeof str !== 'string') throw new TypeError('str must be a string');
  if (!Number.isInteger(length) || length < 0) throw new TypeError('length must be a non-negative integer');
  if (str.length <= length) return str;
  if (length <= suffix.length) return suffix.slice(0, length);
  const trimLen = length - suffix.length;
  return str.slice(0, trimLen) + suffix;
}

/**
 * Pads the start (left) of a string with `char` until it reaches `length`.
 * Matches the API of `String.prototype.padStart` but adds type safety.
 *
 * @param {string} str - Input string.
 * @param {number} length - Target total length.
 * @param {string} [char=' '] - Padding character (single char).
 * @returns {string} Padded string.
 * @example
 * padStart('5', 3, '0'); // '005'
 * padStart('hello', 8);  // '   hello'
 */
export function padStart(str, length, char = ' ') {
  return String(str).padStart(length, char);
}

/**
 * Pads the end (right) of a string with `char` until it reaches `length`.
 *
 * @param {string} str - Input string.
 * @param {number} length - Target total length.
 * @param {string} [char=' '] - Padding character (single char).
 * @returns {string} Padded string.
 * @example
 * padEnd('hello', 8, '.'); // 'hello...'
 */
export function padEnd(str, length, char = ' ') {
  return String(str).padEnd(length, char);
}

/**
 * Capitalises the first character of a string and lowercases the rest.
 *
 * @param {string} str - Input string.
 * @returns {string} Sentence-cased string.
 * @example
 * capitalize('hELLO'); // 'Hello'
 */
export function capitalize(str) {
  if (typeof str !== 'string' || str.length === 0) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Counts the number of non-overlapping occurrences of `needle` in `haystack`.
 *
 * @param {string} haystack - The string to search within.
 * @param {string} needle - The substring to count.
 * @returns {number} Number of occurrences (0 if needle is empty string).
 * @example
 * countOccurrences('banana', 'an'); // 2
 */
export function countOccurrences(haystack, needle) {
  if (typeof haystack !== 'string' || typeof needle !== 'string') {
    throw new TypeError('Both arguments must be strings');
  }
  if (needle.length === 0) return 0;
  let count = 0;
  let pos = 0;
  while ((pos = haystack.indexOf(needle, pos)) !== -1) {
    count++;
    pos += needle.length;
  }
  return count;
}
