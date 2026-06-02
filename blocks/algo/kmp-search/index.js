/**
 * Build the Longest Prefix Suffix (LPS) table for KMP pattern matching
 *
 * @param {string} pattern
 * @returns {number[]} LPS offset mapping values list
 */
export function buildLPSTable(pattern) {
  const lps = new Array(pattern.length).fill(0);
  let len = 0;
  let i = 1;

  while (i < pattern.length) {
    if (pattern[i] === pattern[len]) {
      len++;
      lps[i] = len;
      i++;
    } else {
      if (len !== 0) {
        len = lps[len - 1];
      } else {
        lps[i] = 0;
        i++;
      }
    }
  }

  return lps;
}

/**
 * Perform KMP substring search
 *
 * @param {string} text - The body of text to search within
 * @param {string} pattern - Substring pattern to match
 * @returns {number[]} Array of start indices where pattern matches occur
 */
export function kmpSearch(text, pattern) {
  if (typeof text !== 'string' || typeof pattern !== 'string') {
    throw new Error('InvalidInput: Text and pattern must be strings.');
  }

  const indices = [];
  if (pattern.length === 0) return indices;

  const lps = buildLPSTable(pattern);
  let i = 0; // index for text
  let j = 0; // index for pattern

  while (i < text.length) {
    if (pattern[j] === text[i]) {
      i++;
      j++;
    }

    if (j === pattern.length) {
      indices.push(i - j);
      j = lps[j - 1];
    } else if (i < text.length && pattern[j] !== text[i]) {
      if (j !== 0) {
        j = lps[j - 1];
      } else {
        i++;
      }
    }
  }

  return indices;
}
export default kmpSearch;
