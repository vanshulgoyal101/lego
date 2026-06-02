/**
 * Consistent Hashing Ring
 * Maps keys to nodes on a circular ring using a hash function.
 */
export class ConsistentHash {
  /**
   * @param {number} [replicas=16] - Virtual nodes count per physical node
   */
  constructor(replicas = 16) {
    this.replicas = replicas;
    this.ring = {}; // hash -> node
    this.keys = []; // sorted list of hashes
    this.nodes = new Set();
  }

  /**
   * Simple FNV-1a hash to index points on the ring [0, 2^32 - 1]
   */
  _hash(str) {
    let hash = 0x811c9dc5;
    for (let i = 0; i < str.length; i++) {
      hash ^= str.charCodeAt(i);
      hash = Math.imul(hash, 0x01000193);
    }
    return hash >>> 0;
  }

  /**
   * Add a physical node to the ring, generating virtual replicas
   *
   * @param {string} node
   */
  addNode(node) {
    this.nodes.add(node);
    for (let i = 0; i < this.replicas; i++) {
      const vNodeKey = `${node}-replica-${i}`;
      const hash = this._hash(vNodeKey);
      this.ring[hash] = node;
      this.keys.push(hash);
    }
    this.keys.sort((a, b) => a - b);
  }

  /**
   * Remove a node and all of its virtual replicas from the ring
   *
   * @param {string} node
   */
  removeNode(node) {
    if (!this.nodes.has(node)) return;
    this.nodes.delete(node);

    for (let i = 0; i < this.replicas; i++) {
      const vNodeKey = `${node}-replica-${i}`;
      const hash = this._hash(vNodeKey);
      delete this.ring[hash];
    }

    // Filter out the keys
    this.keys = this.keys.filter(h => h in this.ring);
  }

  /**
   * Get the closest node on the ring for a given query key
   *
   * @param {string} key
   * @returns {string|null} The assigned node ID, or null if ring is empty
   */
  getNode(key) {
    if (this.keys.length === 0) return null;
    const hash = this._hash(key);

    // Binary search to find the first hash on ring >= key's hash
    let low = 0;
    let high = this.keys.length - 1;
    let pos = 0;

    if (hash > this.keys[high]) {
      // Wrap around to the start of the ring
      return this.ring[this.keys[0]];
    }

    while (low <= high) {
      const mid = (low + high) >> 1;
      if (this.keys[mid] >= hash) {
        pos = mid;
        high = mid - 1;
      } else {
        low = mid + 1;
      }
    }

    return this.ring[this.keys[pos]];
  }
}
