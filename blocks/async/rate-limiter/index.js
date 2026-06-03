/**
 * Rate Limiter
 * Limits async function calls using a token bucket algorithm
 * with a sliding window for precise rate enforcement.
 * Zero dependencies.
 */

/**
 * @typedef {Object} RateLimitOptions
 * @property {number} limit - Maximum calls per interval.
 * @property {number} interval - Window size in milliseconds.
 * @property {boolean} [throwOnLimit=false] - If true, throws instead of queuing when limit is hit.
 */

/**
 * A shared rate limiter that controls the rate of async function invocations.
 * Uses a sliding window (call timestamps) to allow bursting up to the limit
 * within any rolling interval window.
 *
 * @example
 * const limiter = new RateLimiter(5, 1000); // 5 calls per second
 * const limitedFetch = limiter.throttle(fetch);
 * // These will be spaced out so no more than 5 happen per second:
 * await Promise.all(urls.map(url => limitedFetch(url)));
 */
export class RateLimiter {
  /**
   * @param {number} limit - Max calls per interval.
   * @param {number} interval - Window in milliseconds.
   */
  constructor(limit, interval) {
    if (limit < 1) throw new RangeError('limit must be at least 1');
    if (interval < 1) throw new RangeError('interval must be at least 1ms');
    /** @type {number} */
    this.limit = limit;
    /** @type {number} */
    this.interval = interval;
    /** @type {number[]} Timestamps of recent calls */
    this._calls = [];
    /** @type {Array<{ resolve: Function, reject: Function, fn: Function, args: any[] }>} */
    this._queue = [];
    /** @type {ReturnType<typeof setTimeout>|null} */
    this._timer = null;
  }

  /**
   * Configure or reconfigure the rate limit parameters.
   * @param {number} n - Max calls per interval.
   * @param {number} interval - Window in milliseconds.
   * @returns {this} Chainable.
   */
  configure(n, interval) {
    this.limit = n;
    this.interval = interval;
    return this;
  }

  /**
   * Wrap an async function so all calls through it are rate-limited.
   *
   * @param {(...args: *[]) => Promise<*>} fn - Async function to wrap.
   * @returns {(...args: *[]) => Promise<*>} Rate-limited wrapper.
   */
  throttle(fn) {
    return (...args) => this._schedule(fn, args);
  }

  /**
   * @private
   */
  _schedule(fn, args) {
    return new Promise((resolve, reject) => {
      this._queue.push({ fn, args, resolve, reject });
      this._flush();
    });
  }

  /**
   * @private
   */
  _flush() {
    const now = Date.now();
    // Remove timestamps outside the current window
    this._calls = this._calls.filter(t => now - t < this.interval);

    while (this._queue.length > 0 && this._calls.length < this.limit) {
      const { fn, args, resolve, reject } = this._queue.shift();
      this._calls.push(Date.now());
      Promise.resolve()
        .then(() => fn(...args))
        .then(resolve, reject);
    }

    if (this._queue.length > 0 && !this._timer) {
      // Schedule next flush at the moment the oldest call exits the window
      const oldest = this._calls[0];
      const delay = this.interval - (Date.now() - oldest) + 1;
      this._timer = setTimeout(() => {
        this._timer = null;
        this._flush();
      }, Math.max(delay, 1));
    }
  }

  /**
   * Returns the number of calls remaining in the current window.
   * @returns {number}
   */
  get remaining() {
    const now = Date.now();
    this._calls = this._calls.filter(t => now - t < this.interval);
    return Math.max(0, this.limit - this._calls.length);
  }

  /**
   * Resets the call history and clears any scheduled timer.
   */
  reset() {
    this._calls = [];
    if (this._timer) {
      clearTimeout(this._timer);
      this._timer = null;
    }
  }
}

/**
 * Wraps any async function with rate limiting (convenience factory).
 *
 * @param {(...args: *[]) => Promise<*>} fn - Function to wrap.
 * @param {RateLimitOptions} options - Rate limit configuration.
 * @returns {(...args: *[]) => Promise<*>} Rate-limited version of fn.
 *
 * @example
 * const limited = rateLimit(fetchData, { limit: 10, interval: 1000 });
 * // Call up to 10 times per second; excess calls are queued
 * const results = await Promise.all(ids.map(id => limited(id)));
 */
export function rateLimit(fn, options = {}) {
  const { limit = 10, interval = 1000 } = options;
  const limiter = new RateLimiter(limit, interval);
  return limiter.throttle(fn);
}
