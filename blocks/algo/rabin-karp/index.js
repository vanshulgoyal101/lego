/**
 * Rabin-Karp substring pattern search algorithm using rolling hashes
 *
 * @param {string} text - Text to search within
 * @param {string} pattern - Pattern to search for
 * @param {number} [d=256] - Base number of alphabet character sets
 * @param {number} [q=101] - Prime number divisor mod bounds for hash sizing
 * @returns {number[]} Array of matching index coordinates
 */
export function rabinKarpSearch(text, pattern, d = 256, q = 101) {
  if (typeof text !== 'string' || typeof pattern !== 'string') {
    throw new Error('InvalidInput: Text and pattern must be strings.');
  }

  const indices = [];
  const n = text.length;
  const m = pattern.length;
  if (m === 0) return indices;

  let p = 0; // Hash value for pattern
  let t = 0; // Hash value for sliding text window
  let h = 1;

  // Compute h = (d^(m-1)) % q
  for (let i = 0; i < m - 1; i++) {
    h = (h * d) % q;
  }

  // Calculate initial hash values
  for (let i = 0; i < m; i++) {
    p = (d * p + pattern.charCodeAt(i)) % q;
    t = (d * t + text.charCodeAt(i)) % q;
  }

  // Slide pattern across text
  for (let i = 0; i <= n - m; i++) {
    // If hashes match, verify characters individually
    if (p === t) {
      let j = 0;
      for (j = 0; j < m; j++) {
        if (text[i + j] !== pattern[j]) {
          break;
        }
      }

      if (j === m) {
        indices.push(i);
      }
    }

    // Roll the hash value for the next window
    if (i < n - m) {
      t = (d * (t - text.charCodeAt(i) * h) + text.charCodeAt(i + m)) % q;

      if (t < 0) {
        t = t + q;
      }
    }
  }

  return indices;
}
export default rabinKarpSearch;
