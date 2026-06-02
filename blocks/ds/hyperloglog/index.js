/**
 * HyperLogLog Probabilistic Cardinality Estimator
 */
export class HyperLogLog {
  /**
   * @param {number} [b=12] - Precision bits. Defaults to 12 (4096 registers, ~1.63% error rate)
   */
  constructor(b = 12) {
    if (b < 4 || b > 16) throw new Error('Precision bits must be between 4 and 16');
    this.b = b;
    this.m = 1 << b; // Number of registers
    this.registers = new Uint8Array(this.m);

    // Alpha constant multiplier
    if (this.m === 16) this.alpha = 0.673;
    else if (this.m === 32) this.alpha = 0.697;
    else if (this.m === 64) this.alpha = 0.709;
    else this.alpha = 0.7213 / (1 + 1.079 / this.m);
  }

  /**
   * Simple FNV-1a 32-bit hash function to hash input elements
   */
  _hash(val) {
    const str = String(val);
    let hash = 1779033703 ^ str.length;
    for (let i = 0; i < str.length; i++) {
      hash = Math.imul(hash ^ str.charCodeAt(i), 3432918353);
      hash = (hash << 13) | (hash >>> 19);
    }
    // Finalize mix
    hash ^= hash >>> 16;
    hash = Math.imul(hash, 2246822507);
    hash ^= hash >>> 13;
    hash = Math.imul(hash, 3266489909);
    hash ^= hash >>> 16;
    return hash >>> 0;
  }

  /**
   * Counts leading zeros of a binary number
   */
  _rho(w) {
    if (w === 0) return 32 - this.b + 1;
    let zeros = 1;
    while ((w & 1) === 0) {
      zeros++;
      w >>>= 1;
    }
    return zeros;
  }

  /**
   * Add a new item to estimate unique counts
   *
   * @param {*} item
   */
  add(item) {
    const h = this._hash(item);
    const j = h >>> (32 - this.b); // Register index (top b bits)
    const w = h & ((1 << (32 - this.b)) - 1); // Remaining bits
    const r = this._rho(w);
    this.registers[j] = Math.max(this.registers[j], r);
  }

  /**
   * Estimates the current cardinality
   *
   * @returns {number} Estimated count
   */
  count() {
    let sum = 0;
    let zeroRegisters = 0;

    for (let i = 0; i < this.m; i++) {
      const reg = this.registers[i];
      sum += Math.pow(2, -reg);
      if (reg === 0) {
        zeroRegisters++;
      }
    }

    let estimate = this.alpha * this.m * this.m * (1 / sum);

    // Linear Counting correction for small range estimates
    if (estimate <= 2.5 * this.m) {
      if (zeroRegisters > 0) {
        estimate = this.m * Math.log(this.m / zeroRegisters);
      }
    }

    return Math.round(estimate);
  }
}
