/**
 * @module algo/lcs
 *
 * Longest Common Subsequence (LCS) algorithm.
 *
 * Uses classic O(M × N) dynamic programming to find the longest subsequence
 * that appears in both input sequences in the same relative order (but not
 * necessarily contiguously).
 *
 * Works on strings (character-by-character) or arrays (element-by-element).
 *
 * Also provides `lcsSimilarity` which normalises the LCS length into a [0, 1]
 * ratio using the formula: 2 * lcsLen / (len(a) + len(b)), analogous to the
 * Sørensen–Dice coefficient.
 */

/**
 * @typedef {Object} LCSResult
 * @property {number}          length   - The length of the longest common subsequence.
 * @property {string|Array}    sequence - The actual LCS (same type as inputs).
 */

/**
 * Computes the Longest Common Subsequence of two sequences.
 *
 * @param {string|Array} a - First sequence.
 * @param {string|Array} b - Second sequence.
 * @returns {LCSResult} Object containing the LCS length and the actual subsequence.
 *
 * @example
 * lcs('ABCBDAB', 'BDCAB');
 * // { length: 4, sequence: 'BCAB' }
 *
 * lcs([1, 3, 4, 5, 6], [3, 5, 6]);
 * // { length: 3, sequence: [3, 5, 6] }
 */
export function lcs(a, b) {
  const isString = typeof a === 'string';
  const m = a.length;
  const n = b.length;

  // Build DP table — dp[i][j] = LCS length of a[0..i-1] and b[0..j-1]
  // Use two-row rolling array to reduce space from O(MN) to O(N)
  // but we need the full table for backtracking, so we keep the full matrix.
  const dp = Array.from({ length: m + 1 }, () => new Uint32Array(n + 1));

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = dp[i - 1][j] > dp[i][j - 1] ? dp[i - 1][j] : dp[i][j - 1];
      }
    }
  }

  // Backtrack to reconstruct the subsequence
  const result = [];
  let i = m, j = n;
  while (i > 0 && j > 0) {
    if (a[i - 1] === b[j - 1]) {
      result.push(a[i - 1]);
      i--;
      j--;
    } else if (dp[i - 1][j] >= dp[i][j - 1]) {
      i--;
    } else {
      j--;
    }
  }

  result.reverse();
  const sequence = isString ? result.join('') : result;

  return { length: dp[m][n], sequence };
}

/**
 * Computes a similarity ratio between two sequences based on their LCS length.
 * Returns a value in [0, 1] where 1 means identical and 0 means no common elements.
 *
 * Formula: 2 * lcsLength / (length(a) + length(b))
 *
 * @param {string|Array} a - First sequence.
 * @param {string|Array} b - Second sequence.
 * @returns {number} Similarity ratio between 0 and 1 (inclusive).
 *
 * @example
 * lcsSimilarity('kitten', 'sitting'); // ~0.615
 * lcsSimilarity('abc', 'abc');        // 1
 * lcsSimilarity('abc', 'xyz');        // 0
 */
export function lcsSimilarity(a, b) {
  if (a.length === 0 && b.length === 0) return 1;
  if (a.length === 0 || b.length === 0) return 0;
  const { length } = lcs(a, b);
  return (2 * length) / (a.length + b.length);
}
