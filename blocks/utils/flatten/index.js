/**
 * Flatten Utility
 * Flattens nested arrays to any depth with multiple convenience helpers.
 * Zero dependencies; uses iterative stack-based approach to avoid
 * stack-overflow on deeply nested input.
 */

/**
 * Flattens a nested array up to `depth` levels deep.
 * Uses an iterative approach to handle very deeply nested arrays safely.
 *
 * @template T
 * @param {any[]} array - The (possibly nested) array to flatten.
 * @param {number} [depth=1] - How many levels of nesting to remove.
 *   Use `Infinity` for unlimited depth.
 * @returns {T[]} A new array flattened to the specified depth.
 * @throws {TypeError} If the first argument is not an array.
 * @example
 * flatten([1, [2, [3, [4]]]], 1); // [1, 2, [3, [4]]]
 * flatten([1, [2, [3]]], 2);      // [1, 2, 3]
 * flatten([1, [2, [3]]], Infinity); // [1, 2, 3]
 */
export function flatten(array, depth = 1) {
  if (!Array.isArray(array)) {
    throw new TypeError('First argument must be an array');
  }
  if (typeof depth !== 'number' || depth < 0) {
    throw new TypeError('depth must be a non-negative number');
  }

  // Use native Array.prototype.flat when depth is finite and small
  if (Number.isFinite(depth) && depth <= 100) {
    return array.flat(depth);
  }

  // Iterative approach for Infinity or very large depths
  return _flattenIterative(array, depth);
}

/**
 * Iterative flatten implementation using an explicit stack.
 * Avoids call-stack overflow for very deeply nested arrays.
 *
 * @param {any[]} array
 * @param {number} maxDepth
 * @returns {any[]}
 */
function _flattenIterative(array, maxDepth) {
  const result = [];
  // Stack items: [value, currentDepth]
  const stack = [];

  for (let i = array.length - 1; i >= 0; i--) {
    stack.push([array[i], 0]);
  }

  while (stack.length > 0) {
    const [item, depth] = stack.pop();

    if (Array.isArray(item) && depth < maxDepth) {
      for (let i = item.length - 1; i >= 0; i--) {
        stack.push([item[i], depth + 1]);
      }
    } else {
      result.push(item);
    }
  }

  return result;
}

/**
 * Recursively flattens a nested array to infinite depth.
 * Equivalent to `flatten(array, Infinity)`.
 *
 * @template T
 * @param {any[]} array - The array to fully flatten.
 * @returns {T[]} A completely flat array.
 * @example
 * flattenDeep([1, [2, [3, [4, [5]]]]]); // [1, 2, 3, 4, 5]
 */
export function flattenDeep(array) {
  return flatten(array, Infinity);
}

/**
 * Computes the maximum nesting depth of an array.
 *
 * @param {any[]} array - The array to measure.
 * @returns {number} The depth (1 = no nesting, 2 = one level, etc.).
 * @example
 * nestingDepth([1, 2, 3]);         // 1
 * nestingDepth([1, [2, [3]]]);     // 3
 */
export function nestingDepth(array) {
  if (!Array.isArray(array)) return 0;
  let maxDepth = 0;
  for (const item of array) {
    if (Array.isArray(item)) {
      const d = nestingDepth(item);
      if (d > maxDepth) maxDepth = d;
    }
  }
  return maxDepth + 1;
}

/**
 * Flattens a 2D array (array of arrays) into a single array.
 * Equivalent to `flatten(array, 1)` but optimised for exactly one level.
 *
 * @template T
 * @param {T[][]} array - Array of arrays.
 * @returns {T[]} Single flat array.
 * @example
 * flattenOnce([[1, 2], [3, 4], [5]]); // [1, 2, 3, 4, 5]
 */
export function flattenOnce(array) {
  if (!Array.isArray(array)) {
    throw new TypeError('First argument must be an array');
  }
  const result = [];
  for (const item of array) {
    if (Array.isArray(item)) {
      for (const el of item) result.push(el);
    } else {
      result.push(item);
    }
  }
  return result;
}
