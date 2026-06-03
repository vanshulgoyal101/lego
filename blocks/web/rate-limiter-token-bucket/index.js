/**
 * Token Bucket Algorithm Rate Limiter
 */
export class TokenBucketLimiter {
  /**
   * @param {number} capacity - Maximum number of tokens the bucket can hold
   * @param {number} refillRate - Number of tokens refilled per second
   */
  constructor(capacity, refillRate) {
    this.capacity = capacity;
    this.refillRate = refillRate; // tokens per second
    this.buckets = new Map();
  }

  _getBucket(key) {
    if (!this.buckets.has(key)) {
      this.buckets.set(key, {
        tokens: this.capacity,
        lastRefill: Date.now()
      });
    }
    return this.buckets.get(key);
  }

  /**
   * Cleans up idle buckets that are fully refilled.
   */
  cleanup() {
    const now = Date.now();
    const expiryAge = (this.capacity / this.refillRate) * 1000;
    for (const [k, b] of this.buckets.entries()) {
      if (now - b.lastRefill > expiryAge) {
        this.buckets.delete(k);
      }
    }
  }

  /**
   * Attempt to consume a specified number of tokens
   *
   * @param {string} key - Unique rate-limit identifier (IP, token, userId)
   * @param {number} [tokensToConsume=1]
   * @returns {boolean} True if allowed (tokens consumed), false if rate-limited
   */
  consume(key, tokensToConsume = 1) {
    const now = Date.now();

    // 1. Periodically run standard cleanup (1% chance)
    if (Math.random() < 0.01) {
      this.cleanup();
    }

    // 2. Enforce absolute size limits to bound memory strictly under load
    if (this.buckets.size >= 10000 && !this.buckets.has(key)) {
      this.cleanup();
      if (this.buckets.size >= 10000) {
        const firstKey = this.buckets.keys().next().value;
        this.buckets.delete(firstKey);
      }
    }

    const bucket = this._getBucket(key);

    // Calculate elapsed time in seconds
    const elapsed = (now - bucket.lastRefill) / 1000;
    bucket.lastRefill = now;

    // Refill bucket tokens based on time elapsed
    bucket.tokens = Math.min(this.capacity, bucket.tokens + elapsed * this.refillRate);

    if (bucket.tokens >= tokensToConsume) {
      bucket.tokens -= tokensToConsume;
      return true;
    }

    return false;
  }
}
