/**
 * Universal TOTP (RFC 6238) and HOTP (RFC 4226) implementation.
 * Uses standard Web Crypto APIs for HMAC-SHA1 signature and handles Base32 secret parsing.
 */

// Base32 Alphabet
const B32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

/**
 * Decodes a Base32 encoded secret into a Uint8Array.
 */
function decodeBase32(str) {
  const clean = str.replace(/=+$/, '').toUpperCase().replace(/[\s-]/g, '');
  const len = clean.length;
  const out = new Uint8Array(Math.floor((len * 5) / 8));
  
  let val = 0;
  let bits = 0;
  let index = 0;

  for (let i = 0; i < len; i++) {
    const idx = B32_ALPHABET.indexOf(clean[i]);
    if (idx === -1) {
      throw new Error(`Invalid Base32 character: ${clean[i]}`);
    }
    
    val = (val << 5) | idx;
    bits += 5;

    if (bits >= 8) {
      bits -= 8;
      out[index++] = (val >>> bits) & 0xff;
    }
  }

  return out;
}

/**
 * Converts a counter number into a 8-byte big-endian Uint8Array.
 */
function counterToBytes(counter) {
  const bytes = new Uint8Array(8);
  let temp = counter;
  for (let i = 7; i >= 0; i--) {
    bytes[i] = temp & 0xff;
    temp = Math.floor(temp / 256);
  }
  return bytes;
}

/**
 * Generates an HMAC-based One-Time Password (HOTP) (RFC 4226).
 *
 * @param {string|Uint8Array} secret - Base32 secret string or raw Uint8Array.
 * @param {number} counter - The integer counter value.
 * @param {number} [digits=6] - Number of output passcode digits.
 * @returns {Promise<string>} The generated token passcode.
 */
export async function generateHotp(secret, counter, digits = 6) {
  const secretKey = typeof secret === 'string' ? decodeBase32(secret) : secret;
  const counterBytes = counterToBytes(counter);

  // Import Key for Web Crypto Subtle API
  const cryptoInstance = typeof crypto !== 'undefined' ? crypto : (await import('crypto')).webcrypto;
  const key = await cryptoInstance.subtle.importKey(
    'raw',
    secretKey,
    { name: 'HMAC', hash: { name: 'SHA-1' } },
    false,
    ['sign']
  );

  const signature = await cryptoInstance.subtle.sign('HMAC', key, counterBytes);
  const signatureBytes = new Uint8Array(signature);

  // Dynamic truncation (RFC 4226 Section 5.4)
  const offset = signatureBytes[signatureBytes.length - 1] & 0xf;
  const binary =
    ((signatureBytes[offset] & 0x7f) << 24) |
    ((signatureBytes[offset + 1] & 0xff) << 16) |
    ((signatureBytes[offset + 2] & 0xff) << 8) |
    (signatureBytes[offset + 3] & 0xff);

  const otpVal = binary % Math.pow(10, digits);
  return otpVal.toString().padStart(digits, '0');
}

/**
 * Generates a Time-based One-Time Password (TOTP) (RFC 6238).
 *
 * @param {string|Uint8Array} secret - Base32 secret string or raw Uint8Array.
 * @param {Object} [options={}] - Configuration options.
 * @param {number} [options.time=Date.now()] - Current epoch timestamp.
 * @param {number} [options.step=30] - Time interval step in seconds.
 * @param {number} [options.digits=6] - Number of passcode digits.
 * @returns {Promise<string>} The generated token passcode.
 */
export async function generateTotp(secret, options = {}) {
  const time = options.time || Date.now();
  const step = options.step || 30;
  const digits = options.digits || 6;

  const counter = Math.floor(time / 1000 / step);
  return generateHotp(secret, counter, digits);
}

/**
 * Verifies a TOTP token value against a base32 secret.
 *
 * @param {string} token - The user input code.
 * @param {string|Uint8Array} secret - Base32 secret string or raw secret bytes.
 * @param {Object} [options={}] - Option configuration.
 * @param {number} [options.window=1] - Counter steps window tolerance (e.g. 1 allows current, previous, and next step codes).
 * @param {number} [options.time=Date.now()] - Current epoch timestamp.
 * @param {number} [options.step=30] - Time interval step in seconds.
 * @param {number} [options.digits=6] - Number of passcode digits.
 * @returns {Promise<boolean>} True if the token is valid, false otherwise.
 */
export async function verifyTotp(token, secret, options = {}) {
  const time = options.time || Date.now();
  const step = options.step || 30;
  const digits = options.digits || 6;
  const windowSize = options.window !== undefined ? options.window : 1;

  const currentCounter = Math.floor(time / 1000 / step);

  for (let i = -windowSize; i <= windowSize; i++) {
    const candidate = await generateHotp(secret, currentCounter + i, digits);
    if (candidate === token) {
      return true;
    }
  }

  return false;
}
