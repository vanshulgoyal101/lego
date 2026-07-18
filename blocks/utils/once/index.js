/**
 * Creates a function that runs only once. Subsequent calls return the first result.
 * If the wrapped function throws (or returns a rejected Promise), the call is not cached.
 *
 * @param {Function} fn - Function to execute once.
 * @returns {Function & { called: boolean, reset: Function }} Wrapped function.
 */
export function once(fn) {
  if (typeof fn !== 'function') {
    throw new TypeError('once expects a function');
  }

  let called = false;
  let value;

  function wrapped(...args) {
    if (called) return value;

    called = true;
    try {
      value = fn.apply(this, args);

      if (value && typeof value.then === 'function') {
        return value.catch((error) => {
          called = false;
          value = undefined;
          throw error;
        });
      }

      return value;
    } catch (error) {
      called = false;
      value = undefined;
      throw error;
    }
  }

  Object.defineProperty(wrapped, 'called', {
    get() {
      return called;
    }
  });

  wrapped.reset = () => {
    called = false;
    value = undefined;
  };

  return wrapped;
}
