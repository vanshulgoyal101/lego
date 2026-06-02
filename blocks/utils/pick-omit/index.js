/**
 * Pick & Omit Utility
 * Selects or excludes properties from objects using key lists or predicates.
 * All functions return new shallow-copy objects and never mutate the source.
 */

/**
 * Creates a new object containing only the specified keys from `obj`.
 * Keys that do not exist on `obj` are silently ignored.
 *
 * @template T extends object
 * @param {T} obj - The source object.
 * @param {(keyof T)[]} keys - Array of keys to include.
 * @returns {Partial<T>} New object with only the picked keys.
 * @example
 * pick({ a: 1, b: 2, c: 3 }, ['a', 'c']); // { a: 1, c: 3 }
 */
export function pick(obj, keys) {
  if (obj === null || typeof obj !== 'object') {
    throw new TypeError('First argument must be an object');
  }
  if (!Array.isArray(keys)) {
    throw new TypeError('keys must be an array');
  }

  const result = {};
  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      result[key] = obj[key];
    }
  }
  return result;
}

/**
 * Creates a new object excluding the specified keys from `obj`.
 * Keys that do not exist on `obj` are silently ignored.
 *
 * @template T extends object
 * @param {T} obj - The source object.
 * @param {(keyof T)[]} keys - Array of keys to exclude.
 * @returns {Partial<T>} New object without the omitted keys.
 * @example
 * omit({ a: 1, b: 2, c: 3 }, ['b']); // { a: 1, c: 3 }
 */
export function omit(obj, keys) {
  if (obj === null || typeof obj !== 'object') {
    throw new TypeError('First argument must be an object');
  }
  if (!Array.isArray(keys)) {
    throw new TypeError('keys must be an array');
  }

  const excluded = new Set(keys);
  const result = {};
  for (const key of Object.keys(obj)) {
    if (!excluded.has(key)) {
      result[key] = obj[key];
    }
  }
  return result;
}

/**
 * Creates a new object containing only keys for which `predicate` returns truthy.
 * The predicate receives the value, key, and original object.
 *
 * @template T extends object
 * @param {T} obj - The source object.
 * @param {function(value: any, key: string, obj: T): boolean} predicate - Filter function.
 * @returns {Partial<T>} New object with only matching keys.
 * @example
 * pickBy({ a: 1, b: 0, c: 2 }, v => v > 0); // { a: 1, c: 2 }
 * pickBy({ x: 'hi', y: 42 }, (v, k) => k !== 'y'); // { x: 'hi' }
 */
export function pickBy(obj, predicate) {
  if (obj === null || typeof obj !== 'object') {
    throw new TypeError('First argument must be an object');
  }
  if (typeof predicate !== 'function') {
    throw new TypeError('predicate must be a function');
  }

  const result = {};
  for (const key of Object.keys(obj)) {
    if (predicate(obj[key], key, obj)) {
      result[key] = obj[key];
    }
  }
  return result;
}

/**
 * Creates a new object excluding keys for which `predicate` returns truthy.
 * Inverse of `pickBy`.
 *
 * @template T extends object
 * @param {T} obj - The source object.
 * @param {function(value: any, key: string, obj: T): boolean} predicate - Exclusion function.
 * @returns {Partial<T>} New object without matching keys.
 * @example
 * omitBy({ a: 1, b: null, c: undefined }, v => v == null); // { a: 1 }
 */
export function omitBy(obj, predicate) {
  if (obj === null || typeof obj !== 'object') {
    throw new TypeError('First argument must be an object');
  }
  if (typeof predicate !== 'function') {
    throw new TypeError('predicate must be a function');
  }

  const result = {};
  for (const key of Object.keys(obj)) {
    if (!predicate(obj[key], key, obj)) {
      result[key] = obj[key];
    }
  }
  return result;
}

/**
 * Renames keys in an object according to a key-map.
 * Keys not present in `keyMap` are carried over unchanged.
 *
 * @param {object} obj - The source object.
 * @param {Record<string, string>} keyMap - Mapping of old key → new key.
 * @returns {object} New object with renamed keys.
 * @example
 * renameKeys({ firstName: 'Ada', age: 36 }, { firstName: 'name' });
 * // { name: 'Ada', age: 36 }
 */
export function renameKeys(obj, keyMap) {
  if (obj === null || typeof obj !== 'object') {
    throw new TypeError('First argument must be an object');
  }

  const result = {};
  for (const key of Object.keys(obj)) {
    const newKey = Object.prototype.hasOwnProperty.call(keyMap, key) ? keyMap[key] : key;
    result[newKey] = obj[key];
  }
  return result;
}
