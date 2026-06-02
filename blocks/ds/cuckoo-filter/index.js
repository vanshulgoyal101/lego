/**
 * Cuckoo Filter
 * Uses cuckoo hashing to store item fingerprints.
 * Supports insert, test, and delete.
 */
export class CuckooFilter {
  /**
   * @param {number} [capacity=1024] - Must be a power of two
   * @param {number} [bucketSize=4] - Number of slots per bucket (b)
   * @param {number} [maxKicks=500] - Limit loops kicks to avoid infinite recursion
   */
  constructor(capacity = 1024, bucketSize = 4, maxKicks = 500) {
    // Ensure capacity is a power of 2
    let cap = 1;
    while (cap < capacity) cap <<= 1;

    this.capacity = cap;
    this.bucketSize = bucketSize;
    this.maxKicks = maxKicks;

    // Table of buckets: array of arrays storing fingerprints (1-byte numbers, 0 = empty)
    this.table = Array.from({ length: this.capacity }, () => new Uint8Array(this.bucketSize));
  }

  /**
   * Generates a 1-byte fingerprint from value
   */
  _fingerprint(str) {
    let hash = 5381;
    for (let i = 0; i < str.length; i++) {
      hash = (hash * 33) ^ str.charCodeAt(i);
    }
    const fp = (hash & 0xFF) || 1; // cannot be 0
    return fp;
  }

  /**
   * Double FNV-1a hash equivalent to find candidate buckets
   */
  _hash(str) {
    let hash = 0x811c9dc5;
    for (let i = 0; i < str.length; i++) {
      hash ^= str.charCodeAt(i);
      hash = Math.imul(hash, 0x01000193);
    }
    return (hash >>> 0) % this.capacity;
  }

  _indexHash(i, fp) {
    // Alternate index: i2 = i1 ^ hash(fp)
    let hash = 0x811c9dc5 ^ fp;
    hash = Math.imul(hash, 0x01000193);
    return ((i ^ hash) >>> 0) % this.capacity;
  }

  /**
   * Insert a new item into the filter
   */
  add(item) {
    const str = String(item);
    const fp = this._fingerprint(str);
    const i1 = this._hash(str);
    const i2 = this._indexHash(i1, fp);

    // Try to insert in i1
    if (this._insertBucket(i1, fp)) return true;
    // Try to insert in i2
    if (this._insertBucket(i2, fp)) return true;

    // Kick elements recursively
    let i = Math.random() < 0.5 ? i1 : i2;
    let currentFp = fp;

    for (let kick = 0; kick < this.maxKicks; kick++) {
      const slot = Math.floor(Math.random() * this.bucketSize);
      const temp = this.table[i][slot];
      this.table[i][slot] = currentFp;
      currentFp = temp;

      // Re-hash kicked fingerprint
      i = this._indexHash(i, currentFp);
      if (this._insertBucket(i, currentFp)) {
        return true;
      }
    }

    throw new Error('Cuckoo Filter is full! (Failed to insert after max kicks)');
  }

  _insertBucket(i, fp) {
    const bucket = this.table[i];
    for (let slot = 0; slot < this.bucketSize; slot++) {
      if (bucket[slot] === 0) {
        bucket[slot] = fp;
        return true;
      }
    }
    return false;
  }

  /**
   * Returns true if item is likely in the filter
   */
  test(item) {
    const str = String(item);
    const fp = this._fingerprint(str);
    const i1 = this._hash(str);
    const i2 = this._indexHash(i1, fp);

    return this._bucketContains(i1, fp) || this._bucketContains(i2, fp);
  }

  _bucketContains(i, fp) {
    const bucket = this.table[i];
    for (let slot = 0; slot < this.bucketSize; slot++) {
      if (bucket[slot] === fp) return true;
    }
    return false;
  }

  /**
   * Deletes an item from the filter
   *
   * @param {*} item
   * @returns {boolean} True if found and deleted
   */
  delete(item) {
    const str = String(item);
    const fp = this._fingerprint(str);
    const i1 = this._hash(str);
    const i2 = this._indexHash(i1, fp);

    if (this._deleteBucket(i1, fp)) return true;
    if (this._deleteBucket(i2, fp)) return true;

    return false;
  }

  _deleteBucket(i, fp) {
    const bucket = this.table[i];
    for (let slot = 0; slot < this.bucketSize; slot++) {
      if (bucket[slot] === fp) {
        bucket[slot] = 0; // Empty the slot
        return true;
      }
    }
    return false;
  }
}
