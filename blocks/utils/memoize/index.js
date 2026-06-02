/**
 * Memoizes a function by caching its results based on input argument signatures.
 *
 * @param {Function} func - Target function to memoize.
 * @param {Function} [resolver] - Optional resolver function to construct custom cache keys based on arguments.
 *   Defaults to JSON stringifying.
 * @returns {Function} Memoized wrapper function.
 */
export function memoize(func, resolver = null) {
  const cache = new Map();

  const memoized = function (...args) {
    const key = resolver ? resolver.apply(this, args) : JSON.stringify(args);

    if (cache.has(key)) {
      return cache.get(key);
    }

    const result = func.apply(this, args);
    cache.set(key, result);
    return result;
  };

  memoized.cache = cache;
  return memoized;
}
