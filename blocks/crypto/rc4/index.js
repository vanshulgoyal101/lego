export class RC4 {
  /**
   * Encrypts or decrypts data using the RC4 stream cipher.
   * @param {string|Uint8Array|Buffer} key - The encryption/decryption key
   * @param {string|Uint8Array|Buffer} data - The input data to encrypt or decrypt
   * @returns {Buffer} The resulting encrypted or decrypted bytes
   */
  static encrypt(key, data) {
    const keyBytes = typeof key === 'string' ? Buffer.from(key, 'utf8') : Buffer.from(key);
    const dataBytes = typeof data === 'string' ? Buffer.from(data, 'utf8') : Buffer.from(data);

    const S = new Uint8Array(256);
    for (let i = 0; i < 256; i++) {
      S[i] = i;
    }

    // Key-Scheduling Algorithm (KSA)
    let j = 0;
    for (let i = 0; i < 256; i++) {
      j = (j + S[i] + keyBytes[i % keyBytes.length]) % 256;
      // Swap S[i] and S[j]
      const temp = S[i];
      S[i] = S[j];
      S[j] = temp;
    }

    // Pseudo-Random Generation Algorithm (PRGA) & XOR
    const output = Buffer.alloc(dataBytes.length);
    let i = 0;
    j = 0;
    for (let k = 0; k < dataBytes.length; k++) {
      i = (i + 1) % 256;
      j = (j + S[i]) % 256;

      // Swap S[i] and S[j]
      const temp = S[i];
      S[i] = S[j];
      S[j] = temp;

      const K = S[(S[i] + S[j]) % 256];
      output[k] = dataBytes[k] ^ K;
    }

    return output;
  }

  /**
   * Helper to encrypt/decrypt a string and output a hex string.
   */
  static encryptToHex(key, data) {
    return this.encrypt(key, data).toString('hex');
  }

  /**
   * Helper to decrypt a hex string back to a UTF-8 string.
   */
  static decryptFromHex(key, hexStr) {
    const dataBytes = Buffer.from(hexStr, 'hex');
    return this.encrypt(key, dataBytes).toString('utf8');
  }
}
