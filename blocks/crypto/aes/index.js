import { webcrypto } from 'crypto';

const crypto = webcrypto || globalThis.crypto;

// Helper to convert Uint8Array to Base64
function bytesToBase64(bytes) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let result = '';
  const len = bytes.length;
  for (let i = 0; i < len; i += 3) {
    const b1 = bytes[i];
    const b2 = i + 1 < len ? bytes[i + 1] : 0;
    const b3 = i + 2 < len ? bytes[i + 2] : 0;

    const enc1 = b1 >> 2;
    const enc2 = ((b1 & 3) << 4) | (b2 >> 4);
    const enc3 = i + 1 < len ? (((b2 & 15) << 2) | (b3 >> 6)) : 64;
    const enc4 = i + 2 < len ? (b3 & 63) : 64;

    result += chars[enc1] + chars[enc2] + 
              (enc3 === 64 ? '=' : chars[enc3]) + 
              (enc4 === 64 ? '=' : chars[enc4]);
  }
  return result;
}

// Helper to convert Base64 to Uint8Array
function base64ToBytes(base64) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  const lookup = new Uint8Array(256);
  for (let i = 0; i < chars.length; i++) {
    lookup[chars.charCodeAt(i)] = i;
  }

  const cleanWithPadding = base64.replace(/[^A-Za-z0-9\+\/=]/g, '');
  const clean = cleanWithPadding.replace(/=/g, '');
  const len = clean.length;

  let pad = 0;
  if (cleanWithPadding.endsWith('==')) {
    pad = 2;
  } else if (cleanWithPadding.endsWith('=')) {
    pad = 1;
  }

  const bufferLength = (cleanWithPadding.length * 3) / 4 - pad;
  const bytes = new Uint8Array(bufferLength);
  let p = 0;

  for (let i = 0; i < len; i += 4) {
    const enc1 = lookup[clean.charCodeAt(i)];
    const enc2 = lookup[clean.charCodeAt(i + 1)];
    const enc3 = i + 2 < len ? lookup[clean.charCodeAt(i + 2)] : 64;
    const enc4 = i + 3 < len ? lookup[clean.charCodeAt(i + 3)] : 64;

    bytes[p++] = (enc1 << 2) | (enc2 >> 4);
    if (enc3 !== 64 && p < bufferLength) {
      bytes[p++] = ((enc2 & 15) << 4) | (enc3 >> 2);
    }
    if (enc4 !== 64 && p < bufferLength) {
      bytes[p++] = ((enc3 & 3) << 6) | enc4;
    }
  }
  return bytes;
}

/**
 * Derive an AES-GCM Key object from a text secret.
 * @private
 */
async function deriveKey(secret) {
  const encoder = new TextEncoder();
  const rawKey = encoder.encode(secret);
  
  // Hash the secret to ensure it is exactly 256 bits (32 bytes) long for AES-256
  const hash = await crypto.subtle.digest('SHA-256', rawKey);
  
  return crypto.subtle.importKey(
    'raw',
    hash,
    { name: 'AES-GCM' },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypt a plaintext string using AES-GCM.
 * @param {string} plaintext - The text to encrypt.
 * @param {string} secret - The encryption password/secret.
 * @returns {Promise<string>} Format: "iv_base64:ciphertext_base64"
 */
export async function encrypt(plaintext, secret) {
  const key = await deriveKey(secret);
  const iv = crypto.getRandomValues(new Uint8Array(12)); // 12-byte IV is standard for AES-GCM
  
  const encoder = new TextEncoder();
  const encodedPlaintext = encoder.encode(plaintext);

  const ciphertextBuffer = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv
    },
    key,
    encodedPlaintext
  );

  const ivBase64 = bytesToBase64(iv);
  const ciphertextBase64 = bytesToBase64(new Uint8Array(ciphertextBuffer));

  return `${ivBase64}:${ciphertextBase64}`;
}

/**
 * Decrypt a cipher string using AES-GCM.
 * @param {string} encryptedString - Format: "iv_base64:ciphertext_base64"
 * @param {string} secret - The encryption password/secret.
 * @returns {Promise<string>} Plaintext decoded output.
 */
export async function decrypt(encryptedString, secret) {
  const parts = encryptedString.split(':');
  if (parts.length !== 2) {
    throw new Error('Invalid encrypted string format');
  }

  const [ivBase64, ciphertextBase64] = parts;
  const iv = base64ToBytes(ivBase64);
  const ciphertext = base64ToBytes(ciphertextBase64);
  
  const key = await deriveKey(secret);

  const decryptedBuffer = await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: iv
    },
    key,
    ciphertext
  );

  return new TextDecoder().decode(decryptedBuffer);
}
