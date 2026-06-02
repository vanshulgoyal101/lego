import { webcrypto } from 'crypto';

const crypto = webcrypto || globalThis.crypto;

// Helper to base64url encode
function base64urlEncode(str) {
  const buf = typeof str === 'string' ? Buffer.from(str, 'utf8') : Buffer.from(str);
  return buf.toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

// Helper to base64url decode
function base64urlDecode(str) {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  return Buffer.from(base64, 'base64').toString('utf8');
}

/**
 * Sign a payload to generate a JWT token (using HMAC SHA-256).
 * @param {Object} payload - The token claims.
 * @param {string} secret - The HMAC secret key.
 * @param {Object} [options]
 * @param {number} [options.expiresIn] - Expiry in seconds from now.
 * @returns {Promise<string>} The signed JWT string.
 */
export async function sign(payload, secret, options = {}) {
  const header = { alg: 'HS256', typ: 'JWT' };
  
  const tokenPayload = { ...payload };
  if (options.expiresIn) {
    tokenPayload.exp = Math.floor(Date.now() / 1000) + options.expiresIn;
  }

  const encodedHeader = base64urlEncode(JSON.stringify(header));
  const encodedPayload = base64urlEncode(JSON.stringify(tokenPayload));
  const signatureInput = `${encodedHeader}.${encodedPayload}`;

  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const data = encoder.encode(signatureInput);

  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', key, data);
  const encodedSignature = base64urlEncode(new Uint8Array(signature));

  return `${signatureInput}.${encodedSignature}`;
}

/**
 * Verify and decode a JWT token (using HMAC SHA-256).
 * @param {string} token - The JWT string.
 * @param {string} secret - The HMAC secret key.
 * @returns {Promise<Object>} The verified payload.
 */
export async function verify(token, secret) {
  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new Error('Invalid token format');
  }

  const [encodedHeader, encodedPayload, encodedSignature] = parts;
  const signatureInput = `${encodedHeader}.${encodedPayload}`;

  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const data = encoder.encode(signatureInput);

  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify']
  );

  // Decode the signature part back to binary buffer
  const signatureBytes = Buffer.from(encodedSignature.replace(/-/g, '+').replace(/_/g, '/'), 'base64');
  
  const isValid = await crypto.subtle.verify(
    'HMAC',
    key,
    signatureBytes,
    data
  );

  if (!isValid) {
    throw new Error('Invalid signature');
  }

  const payload = JSON.parse(base64urlDecode(encodedPayload));
  
  // Validate expiration time if it exists
  if (payload.exp && Date.now() / 1000 > payload.exp) {
    throw new Error('Token expired');
  }

  return payload;
}

/**
 * Decode a token without verifying its signature.
 * @param {string} token - The JWT string.
 * @returns {Object} { header, payload }
 */
export function decode(token) {
  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new Error('Invalid token format');
  }

  return {
    header: JSON.parse(base64urlDecode(parts[0])),
    payload: JSON.parse(base64urlDecode(parts[1]))
  };
}
