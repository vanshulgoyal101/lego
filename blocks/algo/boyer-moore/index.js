/**
 * Build Bad Character table for Boyer-Moore character shift mapping
 *
 * @param {string} pattern
 * @returns {Object} Mapping of character to skip shift distance
 */
export function makeBadCharTable(pattern) {
  const table = {};
  const m = pattern.length;
  // Initialize shifts to pattern length for character indices
  for (let i = 0; i < m - 1; i++) {
    table[pattern[i]] = m - 1 - i;
  }
  return table;
}

/**
 * Boyer-Moore substring search algorithm (bad character heuristic)
 *
 * @param {string} text - Text to search within
 * @param {string} pattern - Pattern to search for
 * @returns {number[]} Array of matching index coordinates
 */
export function boyerMooreSearch(text, pattern) {
  if (typeof text !== 'string' || typeof pattern !== 'string') {
    throw new Error('InvalidInput: Text and pattern must be strings.');
  }

  const indices = [];
  const n = text.length;
  const m = pattern.length;
  if (m === 0) return indices;

  const badChar = makeBadCharTable(pattern);

  let s = 0; // s is pattern shift offset with respect to text
  while (s <= (n - m)) {
    let j = m - 1;

    // Compare characters right to left
    while (j >= 0 && pattern[j] === text[s + j]) {
      j--;
    }

    if (j < 0) {
      indices.push(s);
      // Shift pattern to next lookup
      s += (s + m < n) ? (badChar[text[s + m]] || m) : 1;
    } else {
      const badCharShift = badChar[text[s + j]] || m;
      s += Math.max(1, badCharShift - (m - 1 - j));
    }
  }

  return indices;
}
export default boyerMooreSearch;
