/**
 * Timeout Promise Utilities
 * A collection of promise utilities for timeouts, sleep, retry with
 * exponential backoff, allSettled-with-timeout, and first-fulfilled racing.
 * Zero dependencies.
 */

/**
 * @typedef {Object} RetryOptions
 * @property {number} [attempts=3] - Maximum number of attempts (including the first).
 * @property {number} [delay=200] - Initial delay in ms before first retry.
 * @property {number} [backoff=2] - Exponential backoff multiplier applied to delay each retry.
 * @property {number} [maxDelay=30000] - Maximum delay between retries.
 * @property {(err: Error, attempt: number) => boolean} [shouldRetry] - Return false to stop retrying.
 */

/**
 * Wraps a promise with a timeout. If the promise does not settle within
 * `ms` milliseconds, it rejects with a TimeoutError.
 *
 * @param {Promise<*>} promise - The promise to wrap.
 * @param {number} ms - Timeout in milliseconds.
 * @param {string} [message] - Custom rejection message.
 * @returns {Promise<*>}
 *
 * @example
 * const result = await withTimeout(fetchData(), 5000, 'Fetch timed out');
 */
export function withTimeout(promise, ms, message) {
  if (ms <= 0) return promise;
  const msg = message || `Promise timed out after ${ms}ms`;
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => {
      const err = new Error(msg);
      err.name = 'TimeoutError';
      reject(err);
    }, ms);
  });

  return Promise.race([
    Promise.resolve(promise).finally(() => clearTimeout(timer)),
    timeout,
  ]);
}

/**
 * Returns a promise that resolves after `ms` milliseconds.
 * Useful for introducing delays in async flows.
 *
 * @param {number} ms - Duration in milliseconds.
 * @returns {Promise<void>}
 *
 * @example
 * await sleep(1000); // wait 1 second
 */
export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, Math.max(0, ms)));
}

/**
 * Retries an async function up to `options.attempts` times with
 * exponential backoff between retries.
 *
 * @param {() => Promise<*>} fn - Async function to retry.
 * @param {RetryOptions} [options={}]
 * @returns {Promise<*>} Resolves with the first successful result.
 *
 * @example
 * const data = await retry(() => fetchUnstableAPI(), {
 *   attempts: 5,
 *   delay: 500,
 *   backoff: 2,
 * });
 */
export async function retry(fn, options = {}) {
  const {
    attempts = 3,
    delay = 200,
    backoff = 2,
    maxDelay = 30000,
    shouldRetry = () => true,
  } = options;

  let lastError;
  let currentDelay = delay;

  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (attempt === attempts || !shouldRetry(err, attempt)) {
        throw lastError;
      }
      await sleep(Math.min(currentDelay, maxDelay));
      currentDelay *= backoff;
    }
  }

  throw lastError;
}

/**
 * Runs all promises and waits for them to settle (resolve or reject).
 * If a global timeout is exceeded, rejects with a TimeoutError.
 *
 * @param {Promise<*>[]} promises - Array of promises.
 * @param {number} ms - Global timeout in milliseconds.
 * @returns {Promise<PromiseSettledResult<*>[]>}
 *
 * @example
 * const results = await allSettledWithTimeout([p1, p2, p3], 5000);
 * // results[0].status === 'fulfilled' | 'rejected'
 */
export function allSettledWithTimeout(promises, ms) {
  return withTimeout(Promise.allSettled(promises), ms);
}

/**
 * Races a list of promises and returns the value of the first one to
 * fulfill (resolve). Rejections are ignored unless all promises reject,
 * in which case it rejects with an AggregateError.
 *
 * Semantically equivalent to `Promise.any()` (ES2021) but polyfilled here.
 *
 * @param {Promise<*>[]} promises
 * @returns {Promise<*>}
 *
 * @example
 * const fastest = await firstFulfilled([mirror1(), mirror2(), mirror3()]);
 */
export function firstFulfilled(promises) {
  if (!promises || promises.length === 0) {
    return Promise.reject(new AggregateError([], 'All promises were rejected'));
  }

  return new Promise((resolve, reject) => {
    let rejectedCount = 0;
    const errors = new Array(promises.length);

    promises.forEach((p, i) => {
      Promise.resolve(p).then(
        value => resolve(value),
        err => {
          errors[i] = err;
          rejectedCount++;
          if (rejectedCount === promises.length) {
            reject(new AggregateError(errors, 'All promises were rejected'));
          }
        }
      );
    });
  });
}
