/**
 * Creates a debounced function that delays invoking the provided function
 * until after `wait` milliseconds have elapsed since the last time the
 * debounced function was invoked.
 *
 * @param {Function} func - The function to debounce.
 * @param {number} wait - The number of milliseconds to delay.
 * @param {Object} [options] - Configuration options.
 * @param {boolean} [options.immediate=false] - If true, trigger the function on the leading edge instead of trailing.
 * @returns {Function} Returns the new debounced function.
 */
export function debounce(func, wait, options = {}) {
  const { immediate = false } = options;
  let timeoutId = null;

  return function (...args) {
    const context = this;

    const later = function () {
      timeoutId = null;
      if (!immediate) {
        func.apply(context, args);
      }
    };

    const callNow = immediate && !timeoutId;

    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(later, wait);

    if (callNow) {
      func.apply(context, args);
    }
  };
}
