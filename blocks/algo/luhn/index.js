/**
 * Validates a number string using the Luhn algorithm (Mod 10 formula).
 * Commonly used to validate credit cards (Visa, Mastercard, etc.), IMEI numbers, and identity codes.
 *
 * @param {string|number} value - The identification string or number to validate.
 * @returns {boolean} True if the code satisfies the Luhn check, false otherwise.
 */
export function validateLuhn(value) {
  const str = String(value).replace(/\s/g, ''); // Strip whitespace
  if (!/^\d+$/.test(str)) {
    return false; // Must contain digits only
  }

  let sum = 0;
  let shouldDouble = false;

  // Iterate backwards from the rightmost digit
  for (let i = str.length - 1; i >= 0; i--) {
    let digit = parseInt(str.charAt(i), 10);

    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return sum % 10 === 0;
}
