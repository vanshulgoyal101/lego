/**
 * Count-Min Sketch Probabilistic Frequency Estimator
 */
export class CountMinSketch {
  /**
   * @param {number} width - Table columns count (w)
   * @param {number} depth - Table rows count / hash functions count (d)
   */
  constructor(width, depth) {
    this.w = width;
    this.d = depth;
    // 2D grid matrix: size d x w
    this.table = Array.from({ length: this.d }, () => new Uint32Array(this.w));
  }

  /**
   * FNV-1a hash function matching different seeds to map row columns
   */
  _hash(str, seed) {
    let hash = seed ^ 0x811c9dc5;
    for (let i = 0; i < str.length; i++) {
      hash ^= str.charCodeAt(i);
      hash = Math.imul(hash, 0x01000193);
    }
    return (hash >>> 0) % this.w;
  }

  /**
   * Add / increment element counter
   *
   * @param {*} item
   * @param {number} [count=1]
   */
  add(item, count = 1) {
    const str = String(item);
    for (let i = 0; i < this.d; i++) {
      const col = this._hash(str, i * 1337 + 42);
      this.table[i][col] += count;
    }
  }

  /**
   * Estimates the frequency of an item
   *
   * @param {*} item
   * @returns {number} Estimated count
   */
  estimate(item) {
    const str = String(item);
    let min = Infinity;
    for (let i = 0; i < this.d; i++) {
      const col = this._hash(str, i * 1337 + 42);
      min = Math.min(min, this.table[i][col]);
    }
    return min;
  }
}
