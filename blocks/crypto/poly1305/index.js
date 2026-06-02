/**
 * Poly1305 One-Time Authenticator
 */
export class Poly1305 {
  /**
   * @param {Uint8Array|number[]} key - 32-byte key (r || s)
   */
  constructor(key) {
    if (key.length !== 32) {
      throw new Error('InvalidKey: Poly1305 key must be exactly 32 bytes.');
    }

    // Clamp r
    const rBytes = new Uint8Array(key.slice(0, 16));
    rBytes[3] &= 15;
    rBytes[7] &= 15;
    rBytes[11] &= 15;
    rBytes[15] &= 15;
    rBytes[4] &= 252;
    rBytes[8] &= 252;
    rBytes[12] &= 252;

    this.r = this._leBytesToBigInt(rBytes);
    this.s = this._leBytesToBigInt(key.slice(16, 32));
    this.p = (1n << 130n) - 5n;
  }

  _leBytesToBigInt(bytes) {
    let val = 0n;
    for (let i = bytes.length - 1; i >= 0; i--) {
      val = (val << 8n) + BigInt(bytes[i]);
    }
    return val;
  }

  _bigIntToLeBytes(val, length = 16) {
    const bytes = new Uint8Array(length);
    let temp = val;
    for (let i = 0; i < length; i++) {
      bytes[i] = Number(temp & 0xFFn);
      temp >>= 8n;
    }
    return bytes;
  }

  /**
   * Calculate message authentication tag
   *
   * @param {Uint8Array|Buffer|number[]} message - Message bytes
   * @returns {Uint8Array} 16-byte authentication tag
   */
  auth(message) {
    let a = 0n;
    const msgLen = message.length;
    let offset = 0;

    while (offset < msgLen) {
      const chunkLen = Math.min(16, msgLen - offset);
      const chunk = message.slice(offset, offset + chunkLen);

      let mBlock = this._leBytesToBigInt(chunk);
      mBlock += 1n << (8n * BigInt(chunkLen));

      a = ((a + mBlock) * this.r) % this.p;
      offset += chunkLen;
    }

    const tagVal = (a + this.s) % (1n << 128n);
    return this._bigIntToLeBytes(tagVal, 16);
  }
}
export default Poly1305;
