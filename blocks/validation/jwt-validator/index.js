import { verify } from '../../crypto/jwt-helper/index.js';

/**
 * Validates a JWT Bearer token from incoming request headers or a direct authorization header string.
 * Compatible with Express, Fastify, Next.js, Deno, and standard web Request headers.
 *
 * @param {Object|string} headers - Request headers object (containing authorization) or raw authorization string.
 * @param {string} secret - The HMAC secret key.
 * @returns {Promise<Object>} The verified payload claims.
 * @throws {Error} If authorization header is missing, malformed, or signature is invalid.
 */
export async function validateJwtHeaders(headers, secret) {
  let authHeader = '';

  if (typeof headers === 'string') {
    authHeader = headers;
  } else if (headers && typeof headers === 'object') {
    // Handle both lowercase and capitalized headers
    authHeader = headers['authorization'] || headers['Authorization'] || '';
  }

  if (!authHeader) {
    throw new Error('Authorization header is missing');
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
    throw new Error('Invalid authorization format. Expected Bearer token');
  }

  const token = parts[1];
  
  try {
    return await verify(token, secret);
  } catch (err) {
    throw new Error(`Authentication failed: ${err.message}`);
  }
}
