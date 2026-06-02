/**
 * A math helper class containing standard descriptive statistics calculation formulas.
 * Works on numeric arrays.
 */

/**
 * Calculates the arithmetic mean (average) of an array of numbers.
 * @param {Array<number>} arr
 * @returns {number}
 */
export function mean(arr) {
  if (arr.length === 0) return 0;
  return arr.reduce((sum, val) => sum + val, 0) / arr.length;
}

/**
 * Calculates the median value of an array of numbers.
 * @param {Array<number>} arr
 * @returns {number}
 */
export function median(arr) {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 
    ? sorted[mid] 
    : (sorted[mid - 1] + sorted[mid]) / 2;
}

/**
 * Calculates the mode (most common value) of an array.
 * Returns an array of mode values (handles multi-modal datasets).
 * @param {Array<number>} arr
 * @returns {Array<number>}
 */
export function mode(arr) {
  if (arr.length === 0) return [];
  const freqMap = {};
  let maxFreq = 0;
  
  arr.forEach(val => {
    freqMap[val] = (freqMap[val] || 0) + 1;
    if (freqMap[val] > maxFreq) {
      maxFreq = freqMap[val];
    }
  });

  const modes = [];
  for (const [key, freq] of Object.entries(freqMap)) {
    if (freq === maxFreq) {
      modes.push(Number(key));
    }
  }
  return modes;
}

/**
 * Calculates sample variance of an array.
 * @param {Array<number>} arr
 * @returns {number}
 */
export function variance(arr) {
  if (arr.length < 2) return 0;
  const avg = mean(arr);
  const squaredDiffs = arr.reduce((sum, val) => sum + (val - avg) ** 2, 0);
  return squaredDiffs / (arr.length - 1); // Sample variance
}

/**
 * Calculates sample standard deviation of an array.
 * @param {Array<number>} arr
 * @returns {number}
 */
export function stdDev(arr) {
  return Math.sqrt(variance(arr));
}

/**
 * Calculates the value at a specific percentile p (0 to 100) using linear interpolation.
 * @param {Array<number>} arr
 * @param {number} p - Percentile between 0 and 100.
 * @returns {number}
 */
export function percentile(arr, p) {
  if (arr.length === 0) return 0;
  if (p < 0 || p > 100) {
    throw new RangeError('Percentile p must be between 0 and 100');
  }

  const sorted = [...arr].sort((a, b) => a - b);
  const index = (p / 100) * (sorted.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  const weight = index - lower;

  return sorted[lower] + weight * (sorted[upper] - sorted[lower]);
}
