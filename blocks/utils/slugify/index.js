/**
 * Slugify Utility
 * Converts arbitrary strings into URL-safe slugs.
 * Handles unicode normalisation, accent stripping, special character
 * removal, custom separators, and optional strict mode.
 */

/**
 * @typedef {object} SlugifyOptions
 * @property {string}  [separator='-']  - Character used between words.
 * @property {boolean} [lowercase=true] - Whether to lowercase the result.
 * @property {boolean} [strict=false]   - When true, strips ALL non-alphanumeric chars.
 * @property {number}  [maxLength]      - Truncate the slug to this many characters.
 */

/** Map of common unicode characters to their ASCII equivalents. */
const CHAR_MAP = {
  // Latin extended
  À: 'A', Á: 'A', Â: 'A', Ã: 'A', Ä: 'A', Å: 'A',
  à: 'a', á: 'a', â: 'a', ã: 'a', ä: 'a', å: 'a',
  Æ: 'AE', æ: 'ae',
  Ç: 'C', ç: 'c',
  È: 'E', É: 'E', Ê: 'E', Ë: 'E',
  è: 'e', é: 'e', ê: 'e', ë: 'e',
  Ì: 'I', Í: 'I', Î: 'I', Ï: 'I',
  ì: 'i', í: 'i', î: 'i', ï: 'i',
  Ñ: 'N', ñ: 'n',
  Ò: 'O', Ó: 'O', Ô: 'O', Õ: 'O', Ö: 'O', Ø: 'O',
  ò: 'o', ó: 'o', ô: 'o', õ: 'o', ö: 'o', ø: 'o',
  Ù: 'U', Ú: 'U', Û: 'U', Ü: 'U',
  ù: 'u', ú: 'u', û: 'u', ü: 'u',
  Ý: 'Y', ý: 'y', ÿ: 'y',
  Þ: 'Th', þ: 'th',
  ß: 'ss',
  // Currency / symbols
  '©': 'c', '®': 'r', '™': 'tm',
  '&': 'and', '@': 'at', '#': '',
  '%': 'percent', '+': 'plus'
};

/**
 * Converts a string to a URL-safe slug.
 *
 * @param {string} str - The input string.
 * @param {SlugifyOptions} [options={}] - Configuration options.
 * @returns {string} The URL-safe slug.
 * @example
 * slugify('Hello World!');                    // 'hello-world'
 * slugify('Héllo Wörld', { separator: '_' }); // 'hello_world'
 * slugify('foo & bar');                       // 'foo-and-bar'
 */
export function slugify(str, options = {}) {
  if (typeof str !== 'string') {
    throw new TypeError('Input must be a string');
  }

  const {
    separator = '-',
    lowercase = true,
    strict = false,
    maxLength
  } = options;

  // Step 1: Replace known unicode characters
  let result = str.replace(
    new RegExp(Object.keys(CHAR_MAP).map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'), 'g'),
    match => CHAR_MAP[match] ?? ''
  );

  // Step 2: Normalise remaining unicode (decompose accents) then strip combining marks
  result = result.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  // Step 3: Case conversion
  if (lowercase) result = result.toLowerCase();

  if (strict) {
    // Strict: only keep alphanumeric and separator
    result = result.replace(/[^a-zA-Z0-9]+/g, separator);
  } else {
    // Replace whitespace and punctuation runs with separator
    result = result.replace(/[\s\-_]+/g, separator);
    // Remove any remaining non-word characters (but keep separator)
    const sepEsc = separator.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    result = result.replace(new RegExp(`[^a-zA-Z0-9${sepEsc}]`, 'g'), '');
  }

  // Step 4: Trim leading/trailing separators and collapse runs
  const sepEsc = separator.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  result = result
    .replace(new RegExp(`${sepEsc}+`, 'g'), separator)
    .replace(new RegExp(`^${sepEsc}|${sepEsc}$`, 'g'), '');

  // Step 5: Optional max length (trim at separator boundary if possible)
  if (typeof maxLength === 'number' && maxLength > 0 && result.length > maxLength) {
    result = result.slice(0, maxLength);
    result = result.replace(new RegExp(`${sepEsc}$`), '');
  }

  return result;
}

/**
 * Checks whether a string is already a valid slug (contains only
 * lowercase alphanumeric characters and hyphens, no leading/trailing hyphens).
 *
 * @param {string} str - The string to test.
 * @param {string} [separator='-'] - The separator character to allow.
 * @returns {boolean} True if the string is a valid slug.
 */
export function isSlug(str, separator = '-') {
  if (typeof str !== 'string' || str.length === 0) return false;
  const sepEsc = separator.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`^[a-z0-9]([a-z0-9${sepEsc}]*[a-z0-9])?$`).test(str);
}
