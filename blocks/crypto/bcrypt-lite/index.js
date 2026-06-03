import crypto from 'crypto';

export class BcryptLite {
  /**
   * Generates a random salt string.
   * @returns {string} Base64 salt string
   */
  static genSalt() {
    return crypto.randomBytes(16).toString('base64');
  }

  /**
   * Hashes a password using PBKDF2/HMAC-SHA256 to simulate bcrypt-like cost factor.
   * We combine this with Blowfish-style round counting for slow computation.
   * @param {string} password - The password to hash
   * @param {string} salt - The salt string
   * @param {number} [rounds=10] - Log2 rounds (2^rounds iterations)
   * @returns {Promise<string>} The hashed string
   */
  static async hash(password, salt, rounds = 10) {
    if (rounds < 4 || rounds > 31) {
      throw new Error('Rounds must be between 4 and 31');
    }

    const iterations = Math.pow(2, rounds);
    
    return new Promise((resolve, reject) => {
      // Use PBKDF2 with SHA-256 for CPU intensive hashing mimicking bcrypt's key derivation
      crypto.pbkdf2(password, salt, iterations, 32, 'sha256', (err, derivedKey) => {
        if (err) return reject(err);
        
        const hashStr = derivedKey.toString('base64');
        resolve(`$2b$${rounds}$${salt}$${hashStr}`);
      });
    });
  }

  /**
   * Verifies if a password matches a hash.
   * @param {string} password
   * @param {string} hash
   * @returns {Promise<boolean>}
   */
  static async verify(password, hash) {
    try {
      const parts = hash.split('$');
      if (parts.length !== 5 || parts[1] !== '2b') {
        return false;
      }
      const rounds = parseInt(parts[2], 10);
      const salt = parts[3];
      const expectedHash = parts[4];

      const rehashed = await this.hash(password, salt, rounds);
      const rehashedParts = rehashed.split('$');
      
      // Constant-time comparison
      return crypto.timingSafeEqual(
        Buffer.from(rehashedParts[4], 'base64'),
        Buffer.from(expectedHash, 'base64')
      );
    } catch {
      return false;
    }
  }
}
