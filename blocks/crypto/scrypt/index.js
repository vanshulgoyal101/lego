import crypto from 'crypto';

export class Scrypt {
  /**
   * Hashes a password using scrypt.
   * @param {string|Buffer} password
   * @param {string|Buffer} salt
   * @param {number} [keylen=64] - Length of output key in bytes
   * @param {Object} [options={}] - Optional scrypt parameters
   * @param {number} [options.N=16384] - CPU/memory cost parameter (must be power of 2)
   * @param {number} [options.r=8] - Block size
   * @param {number} [options.p=1] - Parallelization parameter
   * @returns {Promise<Buffer>} The derived key bytes
   */
  static hash(password, salt, keylen = 64, options = {}) {
    const N = options.N || 16384;
    const r = options.r || 8;
    const p = options.p || 1;

    return new Promise((resolve, reject) => {
      crypto.scrypt(password, salt, keylen, { N, r, p }, (err, derivedKey) => {
        if (err) return reject(err);
        resolve(derivedKey);
      });
    });
  }

  /**
   * Verifies if a password matches a derived key.
   * @param {string|Buffer} password
   * @param {string|Buffer} salt
   * @param {string|Buffer} expectedKey - Expected derived key (Buffer or hex string)
   * @param {number} [keylen=64]
   * @param {Object} [options={}]
   * @returns {Promise<boolean>}
   */
  static async verify(password, salt, expectedKey, keylen = 64, options = {}) {
    try {
      const derived = await this.hash(password, salt, keylen, options);
      const expected = typeof expectedKey === 'string' ? Buffer.from(expectedKey, 'hex') : expectedKey;
      
      return crypto.timingSafeEqual(derived, expected);
    } catch {
      return false;
    }
  }
}
