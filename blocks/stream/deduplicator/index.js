/**
 * Stream Deduplicator
 * State-tracking deduplicator that filters duplicates based on key, hash, or sliding window time cache.
 */

export class Deduplicator {
  /**
   * @param {Object} [options]
   * @param {Function} [options.keySelector] Extracts deduplication key from item (default: key/id/JSON)
   * @param {number} [options.ttlMs] Expiration time in milliseconds for cache entries
   * @param {number} [options.maxCacheSize] Maximum cache size before evicting oldest records (FIFO/LRU)
   */
  constructor(options = {}) {
    this.keySelector = options.keySelector || ((item) => {
      if (item && typeof item === 'object') {
        return item.id !== undefined ? String(item.id) : JSON.stringify(item);
      }
      return String(item);
    });

    this.ttlMs = options.ttlMs || null;
    this.maxCacheSize = options.maxCacheSize || null;
    
    // Map of key -> timestamp
    this.cache = new Map();
  }

  /**
   * Check if item is duplicate. If not duplicate, track it.
   * @param {any} item
   * @returns {boolean} True if duplicate, false if new.
   */
  isDuplicate(item) {
    const key = this.keySelector(item);
    const now = Date.now();

    // Check if key exists and handle TTL
    if (this.cache.has(key)) {
      const timestamp = this.cache.get(key);
      if (this.ttlMs && now - timestamp > this.ttlMs) {
        // Expired, delete and treat as new
        this.cache.delete(key);
      } else {
        // Still active duplicate, refresh position if LRU-like behavior is desired
        if (this.maxCacheSize) {
          this.cache.delete(key);
          this.cache.set(key, now);
        }
        return true;
      }
    }

    // Evict oldest if limit reached
    if (this.maxCacheSize && this.cache.size >= this.maxCacheSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }

    this.cache.set(key, now);
    return false;
  }

  /**
   * Filters duplicates from an Iterable or AsyncIterable.
   * @param {Iterable|AsyncIterable} iterable
   * @returns {AsyncGenerator<any>}
   */
  async *transform(iterable) {
    for await (const item of iterable) {
      if (!this.isDuplicate(item)) {
        yield item;
      }
    }
  }

  /**
   * Reset tracking state
   */
  clear() {
    this.cache.clear();
  }
}
