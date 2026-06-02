/**
 * Creates a throttled function that only invokes `func` at most once per
 * every `wait` milliseconds.
 *
 * @param {Function} func - The function to throttle.
 * @param {number} wait - Throttling window in milliseconds.
 * @returns {Function} Throttled output wrapper.
 */
export function throttle(func, wait) {
  let timeoutId = null;
  let lastArgs = null;
  let lastThis = null;
  let lastCallTime = 0;

  const throttled = function (...args) {
    const now = Date.now();
    const remaining = wait - (now - lastCallTime);
    lastArgs = args;
    lastThis = this;

    if (remaining <= 0 || remaining > wait) {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      lastCallTime = now;
      func.apply(lastThis, lastArgs);
    } else if (!timeoutId) {
      timeoutId = setTimeout(() => {
        lastCallTime = Date.now();
        timeoutId = null;
        func.apply(lastThis, lastArgs);
      }, remaining);
    }
  };

  return throttled;
}
