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
   * Attempt to consume a specified number of tokens
   *
   * @param {string} key - Unique rate-limit identifier (IP, token, userId)
   * @param {number} [tokensToConsume=1]
   * @returns {boolean} True if allowed (tokens consumed), false if rate-limited
   */
  consume(key, tokensToConsume = 1) {
    const bucket = this._getBucket(key);
    const now = Date.now();

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
