export class Utf8Validator {
  /**
   * Validates if a byte array/buffer is a valid UTF-8 sequence.
   * @param {Uint8Array|Buffer|number[]} bytes
   * @returns {boolean} True if the sequence is valid UTF-8
   */
  static validate(bytes) {
    const len = bytes.length;
    let i = 0;

    while (i < len) {
      const b1 = bytes[i];

      // 1-byte ASCII (0x00 - 0x7F)
      if (b1 <= 0x7F) {
        i++;
        continue;
      }

      // 2-byte sequence (0xC2 - 0xDF)
      if (b1 >= 0xC2 && b1 <= 0xDF) {
        if (i + 1 >= len) return false;
        const b2 = bytes[i + 1];
        if (b2 < 0x80 || b2 > 0xBF) return false;
        i += 2;
        continue;
      }

      // 3-byte sequence
      if (b1 >= 0xE0 && b1 <= 0xEF) {
        if (i + 2 >= len) return false;
        const b2 = bytes[i + 1];
        const b3 = bytes[i + 2];

        if (b3 < 0x80 || b3 > 0xBF) return false;

        if (b1 === 0xE0) {
          if (b2 < 0xA0 || b2 > 0xBF) return false; // Overlong sequence check
        } else if (b1 === 0xED) {
          if (b2 < 0x80 || b2 > 0x9F) return false; // UTF-16 surrogates check
        } else {
          if (b2 < 0x80 || b2 > 0xBF) return false;
        }

        i += 3;
        continue;
      }

      // 4-byte sequence
      if (b1 >= 0xF0 && b1 <= 0xF4) {
        if (i + 3 >= len) return false;
        const b2 = bytes[i + 1];
        const b3 = bytes[i + 2];
        const b4 = bytes[i + 3];

        if (b3 < 0x80 || b3 > 0xBF) return false;
        if (b4 < 0x80 || b4 > 0xBF) return false;

        if (b1 === 0xF0) {
          if (b2 < 0x90 || b2 > 0xBF) return false; // Overlong check
        } else if (b1 === 0xF4) {
          if (b2 < 0x80 || b2 > 0x8F) return false; // Greater than U+10FFFF check
        } else {
          if (b2 < 0x80 || b2 > 0xBF) return false;
        }

        i += 4;
        continue;
      }

      // Any other byte is invalid prefix
      return false;
    }

    return true;
  }
}
