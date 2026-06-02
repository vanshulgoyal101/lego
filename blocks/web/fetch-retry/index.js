/**
 * A resilient wrapper around the native `fetch` API that automatically retries
 * failed requests with exponential backoff and supports request timeouts.
 *
 * @param {string | URL} url - The URL to request.
 * @param {Object} [options] - Custom options including standard fetch options.
 * @param {number} [options.retries=3] - Maximum number of retry attempts.
 * @param {number} [options.delay=1000] - Base delay in milliseconds between retries.
 * @param {number} [options.timeout=8000] - Timeout in milliseconds after which request is aborted.
 * @param {function} [options.onRetry] - Callback invoked with (error, attemptCount) before each retry.
 * @returns {Promise<Response>} Resolves with the standard Response object.
 */
export async function fetchRetry(url, options = {}) {
  const {
    retries = 3,
    delay = 1000,
    timeout = 8000,
    onRetry = null,
    ...fetchOptions
  } = options;

  let attempt = 0;

  while (true) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal
      });

      // Clear the timeout as request completed successfully (or returned server error response)
      clearTimeout(timeoutId);

      // If the response status is not successful, and we have retries left, we retry for server errors (5xx)
      if (!response.ok && response.status >= 500 && attempt < retries) {
        throw new Error(`Server returned error status: ${response.status}`);
      }

      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      attempt++;

      if (attempt > retries) {
        throw error;
      }

      if (onRetry) {
        onRetry(error, attempt);
      }

      // Exponential backoff delay
      const backoffDelay = delay * Math.pow(2, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, backoffDelay));
    }
  }
}
