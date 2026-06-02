import crypto from 'crypto';

/**
 * Derives a key from a password using PBKDF2 synchronously
 *
 * @param {string|Buffer} password
 * @param {string|Buffer} salt
 * @param {number} iterations
 * @param {number} keylen
 * @param {string} [digest='sha256']
 * @returns {Buffer} Derived key buffer
 */
export function pbkdf2Sync(password, salt, iterations, keylen, digest = 'sha256') {
  const p = typeof password === 'string' ? Buffer.from(password, 'utf8') : password;
  const s = typeof salt === 'string' ? Buffer.from(salt, 'utf8') : salt;
  return crypto.pbkdf2Sync(p, s, iterations, keylen, digest);
}

/**
 * Derives a key from a password using PBKDF2 asynchronously (Promise-based)
 *
 * @param {string|Buffer} password
 * @param {string|Buffer} salt
 * @param {number} iterations
 * @param {number} keylen
 * @param {string} [digest='sha256']
 * @returns {Promise<Buffer>} Derived key buffer
 */
export function pbkdf2(password, salt, iterations, keylen, digest = 'sha256') {
  const p = typeof password === 'string' ? Buffer.from(password, 'utf8') : password;
  const s = typeof salt === 'string' ? Buffer.from(salt, 'utf8') : salt;
  return new Promise((resolve, reject) => {
    crypto.pbkdf2(p, s, iterations, keylen, digest, (err, derivedKey) => {
      if (err) reject(err);
      else resolve(derivedKey);
    });
  });
}
