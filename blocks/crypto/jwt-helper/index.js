import { webcrypto } from 'crypto';

const crypto = webcrypto || globalThis.crypto;

// Standard base64 characters mapping
const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
const LOOKUP = new Uint8Array(256);
for (let i = 0; i < CHARS.length; i++) {
  LOOKUP[CHARS.charCodeAt(i)] = i;
}

// Convert bytes array to base64url string
function bytesToBase64Url(bytes) {
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

    result += CHARS[enc1] + CHARS[enc2] + 
              (enc3 === 64 ? '' : CHARS[enc3]) + 
              (enc4 === 64 ? '' : CHARS[enc4]);
  }

  return result.replace(/\+/g, '-').replace(/\//g, '_');
}

// Convert base64url string to bytes array
function base64UrlToBytes(str) {
  let cleanStr = str.replace(/-/g, '+').replace(/_/g, '/');
  // Add padding
  while (cleanStr.length % 4) {
    cleanStr += '=';
  }

  const len = cleanStr.length;
  let bufferLength = Math.floor(len * 0.75);
  if (cleanStr[cleanStr.length - 1] === '=') {
    bufferLength--;
    if (cleanStr[cleanStr.length - 2] === '=') {
      bufferLength--;
    }
  }

  const bytes = new Uint8Array(bufferLength);
  let p = 0;

  for (let i = 0; i < len; i += 4) {
    const enc1 = LOOKUP[cleanStr.charCodeAt(i)];
    const enc2 = LOOKUP[cleanStr.charCodeAt(i + 1)];
    const enc3 = i + 2 < len ? LOOKUP[cleanStr.charCodeAt(i + 2)] : 64;
    const enc4 = i + 3 < len ? LOOKUP[cleanStr.charCodeAt(i + 3)] : 64;

    const b1 = (enc1 << 2) | (enc2 >> 4);
    const b2 = ((enc2 & 15) << 4) | (enc3 >> 2);
    const b3 = ((enc3 & 3) << 6) | enc4;

    bytes[p++] = b1;
    if (enc3 !== 64 && p < bufferLength) {
      bytes[p++] = b2;
    }
    if (enc4 !== 64 && p < bufferLength) {
      bytes[p++] = b3;
    }
  }

  return bytes;
}

function base64urlEncode(str) {
  const bytes = new TextEncoder().encode(str);
  return bytesToBase64Url(bytes);
}

function base64urlDecode(str) {
  const bytes = base64UrlToBytes(str);
  return new TextDecoder().decode(bytes);
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
  const encodedSignature = bytesToBase64Url(new Uint8Array(signature));

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
  const header = JSON.parse(base64urlDecode(encodedHeader));
  if (!header || header.alg !== 'HS256') {
    throw new Error('Unsupported or invalid algorithm');
  }

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

  const signatureBytes = base64UrlToBytes(encodedSignature);
  
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

  // Validate not before (nbf) time if it exists
  if (payload.nbf && Date.now() / 1000 < payload.nbf) {
    throw new Error('Token not active yet');
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
