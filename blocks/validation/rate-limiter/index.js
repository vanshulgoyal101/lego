/**
 * A sliding-window in-memory Rate Limiter.
 * Throttles action execution rates by user key, IP, or session token.
 */
export class RateLimiter {
  /**
   * @param {number} limit - Maximum operations allowed within the time window.
   * @param {number} windowMs - The time window duration in milliseconds.
   */
  constructor(limit, windowMs) {
    this.limit = limit;
    this.windowMs = windowMs;
    this.records = new Map();
  }

  /**
   * Check if a request key is allowed or rate-limited.
   * Cleans up expired record timestamps dynamically to prevent memory leaks.
   *
   * @param {string} key - Unique rate-limiting key (IP, token, userId).
   * @returns {boolean} True if within limits (allowed), false if rate-limited.
   */
  check(key) {
    const now = Date.now();
    const threshold = now - this.windowMs;

    if (!this.records.has(key)) {
      this.records.set(key, [now]);
      return true;
    }

    const timestamps = this.records.get(key);

    // Filter out timestamps older than sliding window threshold
    const activeTimestamps = timestamps.filter(t => t > threshold);

    if (activeTimestamps.length < this.limit) {
      activeTimestamps.push(now);
      this.records.set(key, activeTimestamps);
      return true;
    }

    // Rate-limited: keep record updated but deny transaction
    this.records.set(key, activeTimestamps);
    return false;
  }

  /**
   * Reset rate-limit status records for a key or clear the whole limiter cache.
   * @param {string} [key]
   */
  reset(key) {
    if (key) {
      this.records.delete(key);
    } else {
      this.records.clear();
    }
  }
}
