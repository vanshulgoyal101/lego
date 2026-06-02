function quarterRound(x, a, b, c, d) {
  x[a] = (x[a] + x[b]) | 0;
  x[d] ^= x[a];
  x[d] = (x[d] << 16) | (x[d] >>> 16);

  x[c] = (x[c] + x[d]) | 0;
  x[b] ^= x[c];
  x[b] = (x[b] << 12) | (x[b] >>> 20);

  x[a] = (x[a] + x[b]) | 0;
  x[d] ^= x[a];
  x[d] = (x[d] << 8) | (x[d] >>> 24);

  x[c] = (x[c] + x[d]) | 0;
  x[b] ^= x[c];
  x[b] = (x[b] << 7) | (x[b] >>> 25);
}

function chachaBlock(out, state) {
  const x = new Int32Array(state);
  for (let i = 0; i < 10; i++) {
    // Column rounds
    quarterRound(x, 0, 4, 8, 12);
    quarterRound(x, 1, 5, 9, 13);
    quarterRound(x, 2, 6, 10, 14);
    quarterRound(x, 3, 7, 11, 15);
    // Diagonal rounds
    quarterRound(x, 0, 5, 10, 15);
    quarterRound(x, 1, 6, 11, 12);
    quarterRound(x, 2, 7, 8, 13);
    quarterRound(x, 3, 4, 9, 14);
  }
  for (let i = 0; i < 16; i++) {
    out[i] = (x[i] + state[i]) | 0;
  }
}

/**
 * ChaCha20 Symmetric Stream Cipher
 */
export class ChaCha20 {
  /**
   * @param {Uint8Array} key - 32-byte key
   * @param {Uint8Array} nonce - 12-byte nonce (96-bit IETF RFC 7539 format)
   * @param {number} [counter=1] - Initial 32-bit block counter
   */
  constructor(key, nonce, counter = 1) {
    if (key.length !== 32) {
      throw new Error('InvalidKeyLength: Key must be exactly 32 bytes.');
    }
    if (nonce.length !== 12) {
      throw new Error('InvalidNonceLength: Nonce must be exactly 12 bytes.');
    }

    this.state = new Int32Array(16);
    
    // Constants: "expand 32-byte k"
    this.state[0] = 0x61707865;
    this.state[1] = 0x3320646e;
    this.state[2] = 0x79622d32;
    this.state[3] = 0x6b206574;

    // Key
    for (let i = 0; i < 8; i++) {
      this.state[4 + i] = 
        key[i * 4] | 
        (key[i * 4 + 1] << 8) | 
        (key[i * 4 + 2] << 16) | 
        (key[i * 4 + 3] << 24);
    }

    // Counter
    this.state[12] = counter;

    // Nonce
    for (let i = 0; i < 3; i++) {
      this.state[13 + i] = 
        nonce[i * 4] | 
        (nonce[i * 4 + 1] << 8) | 
        (nonce[i * 4 + 2] << 16) | 
        (nonce[i * 4 + 3] << 24);
    }
  }

  /**
   * Encrypts or decrypts the input buffer (XOR stream)
   * @param {Uint8Array} data - Input data array to encrypt/decrypt in place
   * @returns {Uint8Array} The output encrypted/decrypted data buffer
   */
  encrypt(data) {
    const out = new Uint8Array(data.length);
    const block = new Int32Array(16);
    const blockBytes = new Uint8Array(64);

    let offset = 0;
    while (offset < data.length) {
      chachaBlock(block, this.state);

      // Serialize block to bytes
      for (let i = 0; i < 16; i++) {
        blockBytes[i * 4] = block[i] & 0xff;
        blockBytes[i * 4 + 1] = (block[i] >>> 8) & 0xff;
        blockBytes[i * 4 + 2] = (block[i] >>> 16) & 0xff;
        blockBytes[i * 4 + 3] = (block[i] >>> 24) & 0xff;
      }

      // XOR
      const chunkLen = Math.min(64, data.length - offset);
      for (let i = 0; i < chunkLen; i++) {
        out[offset + i] = data[offset + i] ^ blockBytes[i];
      }

      offset += chunkLen;

      // Increment 32-bit counter
      this.state[12] = (this.state[12] + 1) | 0;
    }

    return out;
  }

  /**
   * Decrypt is identical to encrypt in stream ciphers
   * @param {Uint8Array} data
   * @returns {Uint8Array}
   */
  decrypt(data) {
    return this.encrypt(data);
  }
}
