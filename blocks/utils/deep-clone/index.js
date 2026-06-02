/**
 * Deep Clone Utility
 * Deep clones any JavaScript value including Dates, Maps, Sets, TypedArrays,
 * RegExp, ArrayBuffers, and circular references.
 */

/**
 * Deep clone a value, handling all standard JavaScript types and circular refs.
 * @param {any} value - The value to clone.
 * @param {WeakMap} [seen=new WeakMap()] - Internal cycle tracker.
 * @returns {any} A deeply cloned copy.
 */
export function deepClone(value, seen = new WeakMap()) {
  // Primitives (null, undefined, number, string, boolean, bigint, symbol)
  if (value === null || typeof value !== 'object' && typeof value !== 'function') {
    return value;
  }

  // Functions: return reference (functions aren't meaningfully cloneable)
  if (typeof value === 'function') {
    return value;
  }

  // Circular reference detection
  if (seen.has(value)) {
    return seen.get(value);
  }

  // Date
  if (value instanceof Date) {
    return new Date(value.getTime());
  }

  // RegExp
  if (value instanceof RegExp) {
    return new RegExp(value.source, value.flags);
  }

  // ArrayBuffer
  if (value instanceof ArrayBuffer) {
    const cloned = new ArrayBuffer(value.byteLength);
    new Uint8Array(cloned).set(new Uint8Array(value));
    return cloned;
  }

  // TypedArrays (Uint8Array, Int32Array, Float64Array, etc.)
  if (ArrayBuffer.isView(value) && !(value instanceof DataView)) {
    const TypedArrayCtor = Object.getPrototypeOf(value).constructor;
    return new TypedArrayCtor(deepClone(value.buffer, seen));
  }

  // DataView
  if (value instanceof DataView) {
    return new DataView(deepClone(value.buffer, seen));
  }

  // Map
  if (value instanceof Map) {
    const clonedMap = new Map();
    seen.set(value, clonedMap);
    for (const [k, v] of value.entries()) {
      clonedMap.set(deepClone(k, seen), deepClone(v, seen));
    }
    return clonedMap;
  }

  // Set
  if (value instanceof Set) {
    const clonedSet = new Set();
    seen.set(value, clonedSet);
    for (const v of value.values()) {
      clonedSet.add(deepClone(v, seen));
    }
    return clonedSet;
  }

  // Array
  if (Array.isArray(value)) {
    const clonedArr = [];
    seen.set(value, clonedArr);
    for (let i = 0; i < value.length; i++) {
      clonedArr[i] = deepClone(value[i], seen);
    }
    return clonedArr;
  }

  // Plain Object (and class instances via prototype chain preservation)
  const proto = Object.getPrototypeOf(value);
  const clonedObj = Object.create(proto);
  seen.set(value, clonedObj);

  for (const key of [...Object.getOwnPropertyNames(value), ...Object.getOwnPropertySymbols(value)]) {
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    if (descriptor.get || descriptor.set) {
      Object.defineProperty(clonedObj, key, descriptor);
    } else {
      Object.defineProperty(clonedObj, key, {
        ...descriptor,
        value: deepClone(descriptor.value, seen)
      });
    }
  }

  return clonedObj;
}
