/**
 * Credit Card Validator
 * Validates credit card numbers using the Luhn algorithm and detects card type.
 * Supports Visa, Mastercard, Amex, Discover, Diners Club, JCB, UnionPay, and Maestro.
 */

/**
 * Card type definition with IIN/BIN prefix patterns and digit lengths.
 * @typedef {Object} CardTypeDefinition
 * @property {string} type - Card type identifier (e.g. 'visa').
 * @property {string} label - Human-readable label (e.g. 'Visa').
 * @property {RegExp} pattern - Regex to match the card number prefix.
 * @property {number[]} lengths - Valid total digit lengths for this card.
 * @property {number[]} groups - How digits are grouped for formatting.
 */

/** @type {CardTypeDefinition[]} */
const CARD_TYPES = [
  {
    type: 'amex',
    label: 'American Express',
    pattern: /^3[47]/,
    lengths: [15],
    groups: [4, 6, 5],
  },
  {
    type: 'dinersclub',
    label: 'Diners Club',
    pattern: /^3(?:0[0-5]|[68])/,
    lengths: [14],
    groups: [4, 6, 4],
  },
  {
    type: 'discover',
    label: 'Discover',
    pattern: /^6(?:011|5[0-9]{2})/,
    lengths: [16],
    groups: [4, 4, 4, 4],
  },
  {
    type: 'jcb',
    label: 'JCB',
    pattern: /^(?:2131|1800|35\d{3})/,
    lengths: [16],
    groups: [4, 4, 4, 4],
  },
  {
    type: 'maestro',
    label: 'Maestro',
    pattern: /^(?:5018|5020|5038|6304|6759|676[1-3])/,
    lengths: [12, 13, 14, 15, 16, 17, 18, 19],
    groups: [4, 4, 4, 4],
  },
  {
    type: 'mastercard',
    label: 'Mastercard',
    pattern: /^5[1-5]|^2(?:2[2-9][1-9]|[3-6]\d{2}|7[01]\d|720)/,
    lengths: [16],
    groups: [4, 4, 4, 4],
  },
  {
    type: 'unionpay',
    label: 'UnionPay',
    pattern: /^62/,
    lengths: [16, 17, 18, 19],
    groups: [4, 4, 4, 4],
  },
  {
    type: 'visa',
    label: 'Visa',
    pattern: /^4/,
    lengths: [13, 16, 19],
    groups: [4, 4, 4, 4],
  },
];

/**
 * Strips all non-digit characters from a card number string.
 * @param {string} number - Raw card number input.
 * @returns {string} Digits only.
 */
function sanitize(number) {
  return String(number).replace(/\D/g, '');
}

/**
 * Validates a card number using the Luhn (mod-10) algorithm.
 * @param {string} digits - String of digits only.
 * @returns {boolean} True if passes Luhn check.
 */
function luhn(digits) {
  let sum = 0;
  let shouldDouble = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let d = parseInt(digits[i], 10);
    if (shouldDouble) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    shouldDouble = !shouldDouble;
  }
  return sum % 10 === 0;
}

/**
 * Detects the card type from the card number.
 *
 * @param {string} number - Credit card number (may contain spaces/dashes).
 * @returns {string} Card type identifier such as 'visa', 'mastercard', 'amex', 'discover', or 'unknown'.
 *
 * @example
 * detectType('4111111111111111') // 'visa'
 * detectType('378282246310005')  // 'amex'
 */
export function detectType(number) {
  const digits = sanitize(number);
  const def = CARD_TYPES.find(ct => ct.pattern.test(digits));
  return def ? def.type : 'unknown';
}

/**
 * Formats a card number into its canonical grouped representation.
 * Uses the detected card type's grouping (e.g. Amex: 4-6-5, Visa: 4-4-4-4).
 *
 * @param {string} number - Credit card number (may contain spaces/dashes).
 * @returns {string} Formatted card number string, or original digits if type unknown.
 *
 * @example
 * formatCard('4111111111111111') // '4111 1111 1111 1111'
 * formatCard('378282246310005')  // '3782 822463 10005'
 */
export function formatCard(number) {
  const digits = sanitize(number);
  const def = CARD_TYPES.find(ct => ct.pattern.test(digits));
  if (!def) return digits;

  let pos = 0;
  const parts = [];
  for (const len of def.groups) {
    if (pos >= digits.length) break;
    parts.push(digits.slice(pos, pos + len));
    pos += len;
  }
  return parts.join(' ');
}

/**
 * Validates a credit card number and returns validation result, card type, and formatted number.
 *
 * @param {string} number - Credit card number (may contain spaces/dashes).
 * @returns {{ valid: boolean, type: string, formatted: string, error?: string }}
 *
 * @example
 * validateCard('4111111111111111')
 * // { valid: true, type: 'visa', formatted: '4111 1111 1111 1111' }
 *
 * validateCard('1234567890123456')
 * // { valid: false, type: 'unknown', formatted: '1234567890123456', error: 'Failed Luhn check' }
 */
export function validateCard(number) {
  const digits = sanitize(number);
  const type = detectType(digits);
  const formatted = formatCard(digits);

  if (digits.length === 0) {
    return { valid: false, type: 'unknown', formatted: '', error: 'Card number is empty' };
  }

  const def = CARD_TYPES.find(ct => ct.type === type);

  if (!def) {
    return { valid: false, type: 'unknown', formatted, error: 'Unrecognized card type' };
  }

  if (!def.lengths.includes(digits.length)) {
    return {
      valid: false,
      type,
      formatted,
      error: `Invalid length ${digits.length} for ${def.label} (expected: ${def.lengths.join(' or ')})`,
    };
  }

  if (!luhn(digits)) {
    return { valid: false, type, formatted, error: 'Failed Luhn algorithm check' };
  }

  return { valid: true, type, formatted };
}
