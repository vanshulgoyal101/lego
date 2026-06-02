/**
 * Deep Merge Utility
 * Recursively merges multiple plain objects from left to right.
 * Supports configurable array merging strategies.
 */

/**
 * @typedef {'concat' | 'replace'} ArrayMergeStrategy
 */

/**
 * @typedef {object} DeepMergeOptions
 * @property {ArrayMergeStrategy} [arrayMerge='replace'] - How to merge arrays:
 *   'replace' overwrites the target array with the source array (default),
 *   'concat' concatenates source elements onto the target array.
 */

/**
 * Checks whether a value is a plain object (not an array, Date, RegExp, etc.).
 *
 * @param {*} val - Value to test.
 * @returns {boolean}
 */
function isPlainObject(val) {
  if (val === null || typeof val !== 'object') return false;
  const proto = Object.getPrototypeOf(val);
  return proto === Object.prototype || proto === null;
}

/**
 * Merges two values according to the provided options.
 *
 * @param {*} target - The base value.
 * @param {*} source - The incoming value that takes precedence.
 * @param {DeepMergeOptions} options - Merge options.
 * @returns {*} The merged result.
 */
function mergeTwo(target, source, options) {
  // If source is not a plain object or array, it simply overrides target.
  if (!isPlainObject(source) && !Array.isArray(source)) {
    return source;
  }

  // Array merging
  if (Array.isArray(source)) {
    if (options.arrayMerge === 'concat' && Array.isArray(target)) {
      return [...target, ...source];
    }
    // Default: replace
    return [...source];
  }

  // Deep merge plain objects
  const output = isPlainObject(target) ? { ...target } : {};

  for (const key of Object.keys(source)) {
    const srcVal = source[key];
    const tgtVal = output[key];

    if (isPlainObject(srcVal) && isPlainObject(tgtVal)) {
      output[key] = mergeTwo(tgtVal, srcVal, options);
    } else if (Array.isArray(srcVal) && Array.isArray(tgtVal) && options.arrayMerge === 'concat') {
      output[key] = [...tgtVal, ...srcVal];
    } else {
      output[key] = Array.isArray(srcVal) ? [...srcVal] : srcVal;
    }
  }

  return output;
}

/**
 * Deep merges multiple objects together, left to right.
 * Later objects overwrite keys from earlier ones; nested plain objects
 * are merged recursively rather than replaced wholesale.
 *
 * @param {...object} objects - Two or more plain objects to merge.
 * @param {DeepMergeOptions} [options={}] - Optional last argument as options object
 *   identified by the presence of an `arrayMerge` property.
 * @returns {object} A new deeply merged object.
 * @example
 * deepMerge({ a: 1, b: { c: 2 } }, { b: { d: 3 } });
 * // => { a: 1, b: { c: 2, d: 3 } }
 *
 * deepMerge({ tags: ['a'] }, { tags: ['b'] }, { arrayMerge: 'concat' });
 * // => { tags: ['a', 'b'] }
 */
export function deepMerge(...args) {
  // Check if last argument is an options object (has arrayMerge key)
  let options = { arrayMerge: 'replace' };
  let objects = args;

  const last = args[args.length - 1];
  if (isPlainObject(last) && 'arrayMerge' in last) {
    options = { arrayMerge: last.arrayMerge };
    objects = args.slice(0, -1);
  }

  if (objects.length === 0) return {};
  if (objects.length === 1) return isPlainObject(objects[0]) ? { ...objects[0] } : {};

  return objects.reduce((acc, obj) => {
    if (!isPlainObject(obj)) return acc;
    return mergeTwo(acc, obj, options);
  }, {});
}

/**
 * Convenience wrapper: deep merges exactly two objects with options.
 *
 * @param {object} target - Base object.
 * @param {object} source - Source object whose values take precedence.
 * @param {DeepMergeOptions} [options={}] - Merge options.
 * @returns {object} Merged result.
 */
export function merge(target, source, options = {}) {
  const opts = { arrayMerge: 'replace', ...options };
  return mergeTwo(target, source, opts);
}
