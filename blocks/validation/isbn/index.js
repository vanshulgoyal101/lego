/**
 * Validate ISBN-10 format and checksum
 *
 * @param {string} isbn
 * @returns {boolean}
 */
export function validateISBN10(isbn) {
  const clean = isbn.replace(/[-\s]/g, '');
  if (clean.length !== 10) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    const digit = parseInt(clean[i], 10);
    if (isNaN(digit)) return false;
    sum += (10 - i) * digit;
  }

  const lastChar = clean[9].toUpperCase();
  if (lastChar === 'X') {
    sum += 10;
  } else {
    const lastDigit = parseInt(lastChar, 10);
    if (isNaN(lastDigit)) return false;
    sum += lastDigit;
  }

  return sum % 11 === 0;
}

/**
 * Validate ISBN-13 format and checksum
 *
 * @param {string} isbn
 * @returns {boolean}
 */
export function validateISBN13(isbn) {
  const clean = isbn.replace(/[-\s]/g, '');
  if (clean.length !== 13) return false;

  let sum = 0;
  for (let i = 0; i < 13; i++) {
    const digit = parseInt(clean[i], 10);
    if (isNaN(digit)) return false;
    const weight = i % 2 === 0 ? 1 : 3;
    sum += weight * digit;
  }

  return sum % 10 === 0;
}

/**
 * Clean up and validate any ISBN-10 or ISBN-13 string
 *
 * @param {string} isbn - Input string to validate
 * @returns {boolean} True if code is correct ISBN format, false otherwise
 */
export function validate(isbn) {
  if (typeof isbn !== 'string') return false;
  const clean = isbn.replace(/[-\s]/g, '');
  if (clean.length === 10) {
    return validateISBN10(clean);
  } else if (clean.length === 13) {
    return validateISBN13(clean);
  }
  return false;
}
export default validate;
