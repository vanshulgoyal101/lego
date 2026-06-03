import crypto from 'crypto';

export class SHA3 {
  /**
   * Computes the SHA-3 hash of a string or buffer.
   * @param {string|Buffer} data - Input data
   * @param {224|256|384|512} [bitLength=256] - SHA-3 output length in bits
   * @returns {string} Hexadecimal hash string
   */
  static hash(data, bitLength = 256) {
    if (![224, 256, 384, 512].includes(bitLength)) {
      throw new Error('Unsupported SHA-3 bit length. Allowed values: 224, 256, 384, 512');
    }

    const algorithm = `sha3-${bitLength}`;
    const hash = crypto.createHash(algorithm);
    
    const input = typeof data === 'string' ? Buffer.from(data, 'utf8') : data;
    hash.update(input);
    
    return hash.digest('hex');
  }

  /**
   * Helper for SHA3-256.
   */
  static sha256(data) {
    return this.hash(data, 256);
  }

  /**
   * Helper for SHA3-512.
   */
  static sha512(data) {
    return this.hash(data, 512);
  }
}
