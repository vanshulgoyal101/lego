/**
 * Bit Manipulation Utilities
 *
 * Pure-JS, zero-dependency utilities for low-level bit operations on 32-bit
 * integers. Includes power-of-two helpers, popcount, individual bit
 * set/clear/toggle/get, bit reversal, and Gray code encode/decode.
 */

/**
 * Check whether n is an exact power of two.
 * @param {number} n - Non-negative integer
 * @returns {boolean}
 * @example isPowerOfTwo(16); // true
 */
export function isPowerOfTwo(n) {
  return n > 0 && (n & (n - 1)) === 0;
}

/**
 * Return the smallest power of two that is >= n.
 * @param {number} n - Non-negative integer
 * @returns {number}
 * @example nextPowerOfTwo(5); // 8
 */
export function nextPowerOfTwo(n) {
  if (n <= 0) return 1;
  if (isPowerOfTwo(n)) return n;
  let p = 1;
  while (p < n) p <<= 1;
  return p;
}

/**
 * Count the number of set (1) bits in a 32-bit integer (Hamming weight /
 * population count).
 * @param {number} n - 32-bit integer
 * @returns {number}
 * @example popCount(0b10110111); // 6
 */
export function popCount(n) {
  // Brian Kernighan's algorithm
  n = n >>> 0; // treat as unsigned 32-bit
  let count = 0;
  while (n) {
    n &= n - 1;
    count++;
  }
  return count;
}

/**
 * Set the bit at position `pos` (0 = LSB).
 * @param {number} n
 * @param {number} pos
 * @returns {number}
 */
export function setBit(n, pos) {
  return (n | (1 << pos)) >>> 0;
}

/**
 * Clear the bit at position `pos`.
 * @param {number} n
 * @param {number} pos
 * @returns {number}
 */
export function clearBit(n, pos) {
  return (n & ~(1 << pos)) >>> 0;
}

/**
 * Toggle the bit at position `pos`.
 * @param {number} n
 * @param {number} pos
 * @returns {number}
 */
export function toggleBit(n, pos) {
  return (n ^ (1 << pos)) >>> 0;
}

/**
 * Get the value of the bit at position `pos` (returns 0 or 1).
 * @param {number} n
 * @param {number} pos
 * @returns {number} 0 or 1
 */
export function getBit(n, pos) {
  return (n >>> pos) & 1;
}

/**
 * Reverse the bits of n within a `bits`-wide field.
 * @param {number} n    - Integer to reverse
 * @param {number} bits - Bit-width (default 32)
 * @returns {number}
 * @example reverseBits(0b1011, 4); // 0b1101 = 13
 */
export function reverseBits(n, bits = 32) {
  n = n >>> 0;
  let result = 0;
  for (let i = 0; i < bits; i++) {
    result = (result << 1) | (n & 1);
    n >>>= 1;
  }
  return result >>> 0;
}

/**
 * Encode an integer to its Gray code equivalent.
 * Consecutive Gray codes differ by exactly one bit.
 * @param {number} n - Non-negative integer
 * @returns {number}
 * @example grayCode(6); // 5  (binary: 110 -> 101)
 */
export function grayCode(n) {
  return (n ^ (n >>> 1)) >>> 0;
}

/**
 * Decode a Gray code back to its natural binary integer.
 * @param {number} g - Gray-coded non-negative integer
 * @returns {number}
 * @example fromGrayCode(5); // 6
 */
export function fromGrayCode(g) {
  g = g >>> 0;
  let n = g;
  let mask = g >>> 1;
  while (mask) {
    n ^= mask;
    mask >>>= 1;
  }
  return n >>> 0;
}
