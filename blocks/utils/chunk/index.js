/**
 * Chunk Utility
 * Splits arrays into fixed-size chunks or groups elements by a predicate.
 */

/**
 * Splits an array into consecutive sub-arrays ("chunks") of at most `size`
 * elements each. The last chunk may contain fewer elements.
 *
 * @template T
 * @param {T[]} array - The array to split.
 * @param {number} size - Maximum elements per chunk. Must be a positive integer.
 * @returns {T[][]} An array of chunk arrays.
 * @throws {TypeError} If `array` is not an array or `size` is not a positive integer.
 * @example
 * chunk([1, 2, 3, 4, 5], 2); // [[1, 2], [3, 4], [5]]
 * chunk(['a', 'b', 'c'], 1); // [['a'], ['b'], ['c']]
 */
export function chunk(array, size) {
  if (!Array.isArray(array)) {
    throw new TypeError('First argument must be an array');
  }
  if (!Number.isInteger(size) || size < 1) {
    throw new TypeError('size must be a positive integer');
  }

  const result = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
}

/**
 * Groups array elements into two buckets based on a boolean predicate.
 * Elements for which `predicate` returns truthy go into the first bucket;
 * falsy elements go into the second bucket.
 *
 * @template T
 * @param {T[]} array - The array to partition.
 * @param {function(T, number, T[]): boolean} predicate - Function called with
 *   (element, index, array) that returns true/false.
 * @returns {[T[], T[]]} Tuple: [matchingElements, nonMatchingElements].
 * @example
 * chunkBy([1, 2, 3, 4, 5], x => x % 2 === 0);
 * // [[2, 4], [1, 3, 5]]
 */
export function chunkBy(array, predicate) {
  if (!Array.isArray(array)) {
    throw new TypeError('First argument must be an array');
  }
  if (typeof predicate !== 'function') {
    throw new TypeError('predicate must be a function');
  }

  const matched = [];
  const unmatched = [];

  for (let i = 0; i < array.length; i++) {
    if (predicate(array[i], i, array)) {
      matched.push(array[i]);
    } else {
      unmatched.push(array[i]);
    }
  }

  return [matched, unmatched];
}

/**
 * Groups array elements into a Map of buckets keyed by the return value
 * of a key selector function. Preserves insertion order per group.
 *
 * @template T
 * @template K
 * @param {T[]} array - The array to group.
 * @param {function(T, number, T[]): K} keyFn - Function that returns the group key.
 * @returns {Map<K, T[]>} Map from group key to the elements in that group.
 * @example
 * groupBy(['one', 'two', 'three'], s => s.length);
 * // Map { 3 => ['one', 'two'], 5 => ['three'] }
 */
export function groupBy(array, keyFn) {
  if (!Array.isArray(array)) {
    throw new TypeError('First argument must be an array');
  }
  if (typeof keyFn !== 'function') {
    throw new TypeError('keyFn must be a function');
  }

  const map = new Map();
  for (let i = 0; i < array.length; i++) {
    const key = keyFn(array[i], i, array);
    if (!map.has(key)) {
      map.set(key, []);
    }
    map.get(key).push(array[i]);
  }
  return map;
}
