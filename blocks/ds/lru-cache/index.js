/**
 * A highly performant Least-Recently-Used (LRU) Cache.
 * Supports a maximum capacity limit and Time-To-Live (TTL) expiration.
 */
export class LruCache {
  /**
   * @param {number} capacity - Maximum number of items the cache can hold.
   * @param {number} [ttl=0] - Key duration lifespan in milliseconds. 0 represents no expiration.
   */
  constructor(capacity, ttl = 0) {
    if (capacity <= 0) {
      throw new Error('Capacity must be greater than 0');
    }
    this.capacity = capacity;
    this.ttl = ttl;
    this.cache = new Map();
  }

  /**
   * Get value of a key. Refreshes item's recency status.
   * @param {*} key
   * @returns {*} Value associated with the key, or undefined if expired or missing.
   */
  get(key) {
    if (!this.cache.has(key)) {
      return undefined;
    }

    const entry = this.cache.get(key);
    
    // Check expiration
    if (this.ttl > 0 && Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return undefined;
    }

    // Refresh recency by removing and re-inserting
    this.cache.delete(key);
    this.cache.set(key, { value: entry.value, timestamp: Date.now() });
    
    return entry.value;
  }

  /**
   * Put / update a key-value pair in cache. Evicts least recently used if capacity is exceeded.
   * @param {*} key
   * @param {*} value
   */
  set(key, value) {
    // If key exists, delete it first to reset position (recency)
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.capacity) {
      // Evict the oldest key (first element in map iterator)
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }

    this.cache.set(key, { value, timestamp: Date.now() });
  }

  /**
   * Delete a key.
   * @param {*} key
   * @returns {boolean} True if key was found and deleted.
   */
  delete(key) {
    return this.cache.delete(key);
  }

  /**
   * Clear the entire cache.
   */
  clear() {
    this.cache.clear();
  }

  /**
   * Get the current size of the cache (includes potentially expired items).
   * @returns {number}
   */
  size() {
    return this.cache.size;
  }
}
