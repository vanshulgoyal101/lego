import { webcrypto } from 'crypto';

const crypto = webcrypto || globalThis.crypto;

// Helper to convert Uint8Array bytes to hex string
function bytesToHex(bytes) {
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// Helper to convert hex string to Uint8Array bytes
function hexToBytes(hex) {
  if (hex.length % 2 !== 0) {
    throw new Error('Invalid hex string length');
  }
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substring(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

/**
 * Generate a SHA-256 hash of a string.
 * @param {string} text - The input text.
 * @returns {Promise<string>} Hex encoded hash.
 */
export async function sha256(text) {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return bytesToHex(new Uint8Array(hashBuffer));
}

/**
 * Derive a secure key or hash using PBKDF2 (similar to bcrypt for password storage).
 * @param {string} password - The plain-text password.
 * @param {string} [salt] - The salt string (hex formatted). If omitted, a random 16-byte salt is generated.
 * @param {number} [iterations=100000] - Hardness factor.
 * @returns {Promise<{ hash: string, salt: string }>} Hex encoded hash and salt.
 */
export async function hashPassword(password, salt = null, iterations = 100000) {
  const encoder = new TextEncoder();
  const passwordBytes = encoder.encode(password);
  
  let saltBytes;
  if (salt) {
    saltBytes = hexToBytes(salt);
  } else {
    saltBytes = crypto.getRandomValues(new Uint8Array(16));
  }

  const baseKey = await crypto.subtle.importKey(
    'raw',
    passwordBytes,
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: saltBytes,
      iterations,
      hash: 'SHA-256'
    },
    baseKey,
    256 // length in bits
  );

  return {
    hash: bytesToHex(new Uint8Array(derivedBits)),
    salt: bytesToHex(saltBytes)
  };
}

/**
 * Verify a password against a PBKDF2 hash and salt.
 * @param {string} password - The plain-text password.
 * @param {string} hash - The stored hash to compare.
 * @param {string} salt - The stored salt.
 * @param {number} [iterations=100000] - Iteration count.
 * @returns {Promise<boolean>} True if password matches.
 */
export async function verifyPassword(password, hash, salt, iterations = 100000) {
  const result = await hashPassword(password, salt, iterations);
  return result.hash === hash;
}
