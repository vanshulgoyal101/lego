/**
 * Computes the Levenshtein distance (edit distance) between two strings.
 * Measures string similarity (insertions, deletions, substitutions).
 *
 * @param {string} a - First string input.
 * @param {string} b - Second string input.
 * @returns {number} The distance (lower values represent higher similarity).
 */
export function levenshteinDistance(a, b) {
  const m = a.length;
  const n = b.length;

  // Short-cut clean match scenarios
  if (m === 0) return n;
  if (n === 0) return m;

  // Optimize space complexity using two rows instead of a full matrix
  let previousRow = Array.from({ length: n + 1 }, (_, i) => i);
  let currentRow = new Array(n + 1);

  for (let i = 1; i <= m; i++) {
    currentRow[0] = i;
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      currentRow[j] = Math.min(
        currentRow[j - 1] + 1, // insertion
        previousRow[j] + 1,    // deletion
        previousRow[j - 1] + cost // substitution
      );
    }
    previousRow = [...currentRow];
  }

  return previousRow[n];
}

/**
 * Calculates a similarity percentage index between two strings (0 to 100).
 * @param {string} a
 * @param {string} b
 * @returns {number} Percentage score (100 represents identical match).
 */
export function stringSimilarity(a, b) {
  const distance = levenshteinDistance(a, b);
  const maxLength = Math.max(a.length, b.length);
  if (maxLength === 0) return 100;
  return Math.round(((maxLength - distance) / maxLength) * 100);
}
