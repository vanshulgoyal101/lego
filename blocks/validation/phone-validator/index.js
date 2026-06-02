/**
 * Phone Number Validator
 * International phone number validation, formatting to E.164,
 * and extraction from freeform text. Zero external dependencies.
 */

/**
 * Country dial-code map (ISO 3166-1 alpha-2 → dial code + expected subscriber length range).
 * @type {Object.<string, { dialCode: string, minLength: number, maxLength: number }>}
 */
const COUNTRY_DATA = {
  US: { dialCode: '1',  minLength: 10, maxLength: 10 },
  CA: { dialCode: '1',  minLength: 10, maxLength: 10 },
  GB: { dialCode: '44', minLength: 10, maxLength: 10 },
  AU: { dialCode: '61', minLength: 9,  maxLength: 9  },
  IN: { dialCode: '91', minLength: 10, maxLength: 10 },
  DE: { dialCode: '49', minLength: 10, maxLength: 11 },
  FR: { dialCode: '33', minLength: 9,  maxLength: 9  },
  JP: { dialCode: '81', minLength: 10, maxLength: 10 },
  CN: { dialCode: '86', minLength: 11, maxLength: 11 },
  BR: { dialCode: '55', minLength: 10, maxLength: 11 },
  MX: { dialCode: '52', minLength: 10, maxLength: 10 },
  ZA: { dialCode: '27', minLength: 9,  maxLength: 9  },
  NG: { dialCode: '234', minLength: 10, maxLength: 10 },
  KE: { dialCode: '254', minLength: 9,  maxLength: 9  },
  PK: { dialCode: '92', minLength: 10, maxLength: 10 },
  BD: { dialCode: '880', minLength: 10, maxLength: 10 },
  RU: { dialCode: '7',  minLength: 10, maxLength: 10 },
  IT: { dialCode: '39', minLength: 9,  maxLength: 11 },
  ES: { dialCode: '34', minLength: 9,  maxLength: 9  },
  NL: { dialCode: '31', minLength: 9,  maxLength: 9  },
};

/**
 * Strip all non-digit characters from a string.
 * @param {string} str
 * @returns {string}
 */
function digitsOnly(str) {
  return String(str).replace(/\D/g, '');
}

/**
 * Checks if a phone number is in E.164 format.
 * E.164: starts with +, followed by 7–15 digits.
 *
 * @param {string} number - Raw phone number string.
 * @returns {boolean}
 */
export function isE164(number) {
  return /^\+[1-9]\d{6,14}$/.test(String(number).trim());
}

/**
 * Validates an international phone number.
 * Without a countryCode, validates as E.164.
 * With a countryCode, also accepts local subscriber numbers of correct length.
 *
 * @param {string} number - Phone number (may include +, spaces, dashes, parentheses).
 * @param {string} [countryCode] - ISO 3166-1 alpha-2 country code (e.g. 'US').
 * @returns {{ valid: boolean, e164?: string, error?: string }}
 *
 * @example
 * isValidPhone('+14155552671')              // { valid: true, e164: '+14155552671' }
 * isValidPhone('4155552671', 'US')          // { valid: true, e164: '+14155552671' }
 * isValidPhone('not-a-phone')               // { valid: false, error: '...' }
 */
export function isValidPhone(number, countryCode) {
  const raw = String(number).trim();

  if (!raw) {
    return { valid: false, error: 'Phone number is empty' };
  }

  // Always accept E.164
  if (isE164(raw)) {
    return { valid: true, e164: raw };
  }

  const digits = digitsOnly(raw);

  if (digits.length < 7) {
    return { valid: false, error: 'Phone number is too short' };
  }

  if (countryCode) {
    const country = COUNTRY_DATA[countryCode.toUpperCase()];
    if (!country) {
      // Unknown country code — fall back to generic range check
      if (digits.length < 7 || digits.length > 15) {
        return { valid: false, error: `Digit count ${digits.length} out of valid range (7–15)` };
      }
      return { valid: true, e164: `+${digits}` };
    }

    // If user supplied the dial code prefix, strip it
    let subscriber = digits;
    if (digits.startsWith(country.dialCode)) {
      subscriber = digits.slice(country.dialCode.length);
    }

    if (subscriber.length < country.minLength || subscriber.length > country.maxLength) {
      return {
        valid: false,
        error: `For ${countryCode}, subscriber number should be ${country.minLength}–${country.maxLength} digits; got ${subscriber.length}`,
      };
    }

    return { valid: true, e164: `+${country.dialCode}${subscriber}` };
  }

  // No country code — accept any 7–15 digit string as a generic number
  if (digits.length >= 7 && digits.length <= 15) {
    return { valid: true, e164: `+${digits}` };
  }

  return { valid: false, error: `Digit count ${digits.length} is outside valid range (7–15)` };
}

/**
 * Formats a phone number to the national display format for a country,
 * or to E.164 if no country is provided.
 *
 * @param {string} number - Raw phone number.
 * @param {string} [countryCode] - ISO 3166-1 alpha-2 country code.
 * @returns {string} Formatted phone number, or original input if formatting fails.
 *
 * @example
 * formatPhone('4155552671', 'US')  // '+1 (415) 555-2671'
 * formatPhone('+14155552671')      // '+14155552671'
 */
export function formatPhone(number, countryCode) {
  const result = isValidPhone(number, countryCode);
  if (!result.valid || !result.e164) return String(number);

  const e164 = result.e164; // e.g. '+14155552671'

  if (!countryCode) return e164;

  const country = COUNTRY_DATA[countryCode.toUpperCase()];
  if (!country) return e164;

  const subscriber = e164.slice(1 + country.dialCode.length);
  const cc = country.dialCode;

  // US/CA: +1 (NXX) NXX-XXXX
  if (cc === '1' && subscriber.length === 10) {
    return `+1 (${subscriber.slice(0, 3)}) ${subscriber.slice(3, 6)}-${subscriber.slice(6)}`;
  }

  // Generic: +[dialCode] [subscriber]
  return `+${cc} ${subscriber}`;
}

/**
 * Extracts all phone-like patterns from a block of freeform text.
 * Looks for digit sequences of 7–15 digits optionally prefixed with +.
 *
 * @param {string} text - Freeform text to scan.
 * @returns {string[]} Array of matched phone-like strings (raw, unformatted).
 *
 * @example
 * extractPhone('Call us at +1-415-555-2671 or 0800123456')
 * // ['+1-415-555-2671', '0800123456']
 */
export function extractPhone(text) {
  if (typeof text !== 'string') return [];
  const pattern = /\+?[\d][\d\s\-().]{5,18}[\d]/g;
  const matches = text.match(pattern) || [];
  // Filter by digit count to reduce false positives
  return matches.filter(m => {
    const d = digitsOnly(m);
    return d.length >= 7 && d.length <= 15;
  });
}
