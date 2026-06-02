/**
 * Efficient String Pattern Search Algorithms
 *
 * Three classic substring search algorithms, each returning an array of
 * all (zero-indexed) start positions where the pattern occurs in text.
 *
 * - kmpSearch   – Knuth-Morris-Pratt: O(n + m)
 * - boyerMoore  – Boyer-Moore (bad character heuristic): O(n * m) worst case,
 *                 O(n / m) typical
 * - rabinKarp   – Rabin-Karp rolling hash: O(n + m) average
 */

/**
 * Build the KMP failure function (partial match table).
 * @param {string} pattern
 * @returns {number[]}
 */
function buildKMPTable(pattern) {
  const m = pattern.length;
  const lps = new Array(m).fill(0);
  let len = 0;
  let i = 1;
  while (i < m) {
    if (pattern[i] === pattern[len]) {
      lps[i++] = ++len;
    } else if (len > 0) {
      len = lps[len - 1];
    } else {
      lps[i++] = 0;
    }
  }
  return lps;
}

/**
 * Knuth-Morris-Pratt string search.
 * Preprocesses the pattern to avoid redundant comparisons, achieving O(n+m).
 *
 * @param {string} text    - Text to search within
 * @param {string} pattern - Pattern to search for
 * @returns {number[]} Array of starting indices of all matches
 * @example kmpSearch("ababcabcab", "abc"); // [2, 5]
 */
export function kmpSearch(text, pattern) {
  if (pattern.length === 0) return [];
  const n = text.length, m = pattern.length;
  const lps = buildKMPTable(pattern);
  const matches = [];
  let i = 0, j = 0;
  while (i < n) {
    if (text[i] === pattern[j]) {
      i++; j++;
    }
    if (j === m) {
      matches.push(i - j);
      j = lps[j - 1];
    } else if (i < n && text[i] !== pattern[j]) {
      if (j > 0) j = lps[j - 1];
      else i++;
    }
  }
  return matches;
}

/**
 * Build the Boyer-Moore bad-character table.
 * Maps each character to its last occurrence index in the pattern.
 * @param {string} pattern
 * @returns {Map<string, number>}
 */
function buildBadChar(pattern) {
  const table = new Map();
  for (let i = 0; i < pattern.length; i++) {
    table.set(pattern[i], i);
  }
  return table;
}

/**
 * Boyer-Moore string search (bad character heuristic).
 * Often sub-linear in practice because it can skip large sections of text.
 *
 * @param {string} text    - Text to search within
 * @param {string} pattern - Pattern to search for
 * @returns {number[]} Array of starting indices of all matches
 * @example boyerMoore("ABAAABCD", "ABC"); // [4]
 */
export function boyerMoore(text, pattern) {
  if (pattern.length === 0) return [];
  const n = text.length, m = pattern.length;
  const badChar = buildBadChar(pattern);
  const matches = [];
  let s = 0; // shift of pattern relative to text

  while (s <= n - m) {
    let j = m - 1;
    while (j >= 0 && pattern[j] === text[s + j]) j--;
    if (j < 0) {
      matches.push(s);
      s += s + m < n ? m - (badChar.get(text[s + m]) ?? -1) : 1;
    } else {
      const bc = badChar.get(text[s + j]) ?? -1;
      s += Math.max(1, j - bc);
    }
  }
  return matches;
}

/**
 * Rabin-Karp rolling-hash string search.
 * Uses polynomial hashing to find candidate matches in O(n) average,
 * verifying each with direct comparison.
 *
 * @param {string} text    - Text to search within
 * @param {string} pattern - Pattern to search for
 * @returns {number[]} Array of starting indices of all matches
 * @example rabinKarp("aababab", "ab"); // [1, 3, 5]
 */
export function rabinKarp(text, pattern) {
  if (pattern.length === 0) return [];
  const n = text.length, m = pattern.length;
  if (m > n) return [];

  const BASE = 31;
  const MOD = 1_000_000_007;

  // Precompute powers of BASE up to m
  const pow = new Array(m).fill(1);
  for (let i = 1; i < m; i++) pow[i] = (pow[i - 1] * BASE) % MOD;

  // Compute initial hashes
  let patHash = 0, winHash = 0;
  for (let i = 0; i < m; i++) {
    const cp = (pattern.charCodeAt(i) - 96 + 96) % MOD; // keep positive
    const ct = (text.charCodeAt(i) - 96 + 96) % MOD;
    patHash = (patHash + cp * pow[m - 1 - i]) % MOD;
    winHash = (winHash + ct * pow[m - 1 - i]) % MOD;
  }

  const matches = [];

  for (let i = 0; i <= n - m; i++) {
    if (winHash === patHash) {
      // Verify character by character to avoid hash collisions
      if (text.slice(i, i + m) === pattern) matches.push(i);
    }
    if (i < n - m) {
      const outChar = (text.charCodeAt(i) - 96 + 96) % MOD;
      const inChar  = (text.charCodeAt(i + m) - 96 + 96) % MOD;
      winHash = ((winHash - outChar * pow[m - 1]) % MOD + MOD) % MOD;
      winHash = (winHash * BASE + inChar) % MOD;
    }
  }
  return matches;
}
