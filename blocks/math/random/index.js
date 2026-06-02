/**
 * A utility class for random generation operations.
 * Supports range integers, random selections, weighted selections, and UUID v4 generation.
 */

/**
 * Generate a standard UUID v4 string.
 * @returns {string}
 */
export function uuidv4() {
  // Use crypto API if available, else fallback to Math.random
  const cryptoObj = typeof globalThis !== 'undefined' ? (globalThis.crypto || globalThis.msCrypto) : null;
  
  if (cryptoObj && cryptoObj.randomUUID) {
    return cryptoObj.randomUUID();
  }

  if (cryptoObj && cryptoObj.getRandomValues) {
    const buf = new Uint8Array(16);
    cryptoObj.getRandomValues(buf);
    
    // Set UUID v4 variant/version bits
    buf[6] = (buf[6] & 0x0f) | 0x40; // Version 4
    buf[8] = (buf[8] & 0x3f) | 0x80; // Variant 10xxxxxx
    
    const hex = Array.from(buf).map(b => b.toString(16).padStart(2, '0'));
    return `${hex.slice(0, 4).join('')}-${hex.slice(4, 6).join('')}-${hex.slice(6, 8).join('')}-${hex.slice(8, 10).join('')}-${hex.slice(10, 16).join('')}`;
  }

  // Fallback
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Get a random integer in a range [min, max] (inclusive).
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export function randomInt(min, max) {
  const minVal = Math.ceil(min);
  const maxVal = Math.floor(max);
  return Math.floor(Math.random() * (maxVal - minVal + 1)) + minVal;
}

/**
 * Choose a random item from an array.
 * @param {Array} arr
 * @returns {*}
 */
export function choice(arr) {
  if (arr.length === 0) return undefined;
  return arr[randomInt(0, arr.length - 1)];
}

/**
 * Pick an item from an array based on weighted probabilities.
 * @param {Array} items - Options list.
 * @param {Array<number>} weights - Matching weight weights corresponding to items index.
 * @returns {*} Selected item.
 */
export function weightedChoice(items, weights) {
  if (items.length !== weights.length || items.length === 0) {
    throw new Error('Items and weights must have matching non-zero lengths');
  }

  const sum = weights.reduce((acc, w) => acc + w, 0);
  let threshold = Math.random() * sum;

  for (let i = 0; i < items.length; i++) {
    threshold -= weights[i];
    if (threshold <= 0) {
      return items[i];
    }
  }

  return items[items.length - 1]; // Fallback safety
}
