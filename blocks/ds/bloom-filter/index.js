/**
 * A space-efficient probabilistic Bloom Filter.
 * Used to check membership of elements. Can return false-positives, but guarantees zero false-negatives.
 */
export class BloomFilter {
  /**
   * @param {number} size - Number of bits in the filter array.
   * @param {number} [hashFunctionsCount=3] - Number of hash iterations to run per element.
   */
  constructor(size, hashFunctionsCount = 3) {
    this.size = size;
    this.hashFunctionsCount = hashFunctionsCount;
    // Fast bit field representation using a Uint8Array
    this.bitArray = new Uint8Array(Math.ceil(size / 8));
  }

  /**
   * Internal polynomial rolling hash helper.
   * Runs multiple hash functions by generating distinct seeds.
   * @private
   */
  _hash(str, seed) {
    let hash = 0;
    const prime = 31;
    for (let i = 0; i < str.length; i++) {
      hash = (hash * prime + str.charCodeAt(i) + seed) % this.size;
    }
    return Math.abs(hash);
  }

  /**
   * Set bit at specific index.
   * @private
   */
  _setBit(index) {
    const byteIndex = Math.floor(index / 8);
    const bitOffset = index % 8;
    this.bitArray[byteIndex] |= (1 << bitOffset);
  }

  /**
   * Check bit status at index.
   * @private
   */
  _getBit(index) {
    const byteIndex = Math.floor(index / 8);
    const bitOffset = index % 8;
    return (this.bitArray[byteIndex] & (1 << bitOffset)) !== 0;
  }

  /**
   * Add a string item to the filter.
   * @param {string} item
   */
  add(item) {
    const str = String(item);
    for (let i = 0; i < this.hashFunctionsCount; i++) {
      const idx = this._hash(str, i * 42 + 7);
      this._setBit(idx);
    }
  }

  /**
   * Check if a string item is likely in the filter.
   * @param {string} item
   * @returns {boolean} False if definitely not present, true if likely present.
   */
  test(item) {
    const str = String(item);
    for (let i = 0; i < this.hashFunctionsCount; i++) {
      const idx = this._hash(str, i * 42 + 7);
      if (!this._getBit(idx)) {
        return false; // Definitely not present
      }
    }
    return true; // Probable match
  }
}
