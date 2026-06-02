/**
 * A generalized async task execution retrier.
 * Executes an async operation, and automatically retries upon failure
 * utilizing exponential backoff with randomized delay jitter.
 */

/**
 * Execute a task with resilient retries.
 * @param {Function} task - Async function returning a promise.
 * @param {Object} [options={}]
 * @param {number} [options.retries=3] - Maximum retry attempts.
 * @param {number} [options.delay=1000] - Base delay in milliseconds.
 * @param {number} [options.factor=2] - Exponential growth factor.
 * @param {boolean} [options.jitter=true] - Randomize delay windows to prevent thundering herd crashes.
 * @param {Function} [options.shouldRetry] - Callback (error) => boolean determining whether to retry or abort.
 * @returns {Promise<*>} Resolved task output.
 */
export async function retry(task, options = {}) {
  const {
    retries = 3,
    delay = 1000,
    factor = 2,
    jitter = true,
    shouldRetry = () => true
  } = options;

  let attempt = 0;

  while (true) {
    try {
      return await task();
    } catch (error) {
      attempt++;

      if (attempt > retries || !shouldRetry(error)) {
        throw error;
      }

      // Calculate exponential delay
      let nextDelay = delay * Math.pow(factor, attempt - 1);
      
      if (jitter) {
        // Introduce randomized jitter (+/- 25% of delay)
        const range = nextDelay * 0.25;
        const randomShift = Math.random() * (range * 2) - range;
        nextDelay = Math.max(0, nextDelay + randomShift);
      }

      await new Promise(resolve => setTimeout(resolve, nextDelay));
    }
  }
}
