/**
 * String Distance Algorithms
 *
 * Multiple edit-distance and similarity metrics for comparing strings:
 * - Levenshtein distance
 * - Hamming distance
 * - Jaro similarity
 * - Jaro-Winkler similarity
 * - Damerau-Levenshtein distance (with transpositions)
 *
 * All functions accept two strings and return a numeric score.
 * Distance functions return 0 for identical strings.
 * Similarity functions return 1 for identical strings.
 */

/**
 * Compute the Levenshtein edit distance between strings a and b.
 * Counts the minimum number of single-character insertions, deletions,
 * or substitutions to transform a into b.
 *
 * @param {string} a
 * @param {string} b
 * @returns {number} Integer distance (0 = identical)
 * @example levenshtein("kitten", "sitting"); // 3
 */
export function levenshtein(a, b) {
  const m = a.length, n = b.length;
  // Use two rows to save memory
  let prev = Array.from({ length: n + 1 }, (_, i) => i);
  let curr = new Array(n + 1);
  for (let i = 1; i <= m; i++) {
    curr[0] = i;
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(
        prev[j] + 1,        // deletion
        curr[j - 1] + 1,    // insertion
        prev[j - 1] + cost  // substitution
      );
    }
    [prev, curr] = [curr, prev];
  }
  return prev[n];
}

/**
 * Compute the Hamming distance between two strings of equal length.
 * Returns the number of positions where characters differ.
 *
 * @param {string} a
 * @param {string} b
 * @returns {number}
 * @throws {Error} If strings have different lengths
 * @example hamming("karolin", "kathrin"); // 3
 */
export function hamming(a, b) {
  if (a.length !== b.length) {
    throw new Error('hamming: strings must have the same length');
  }
  let dist = 0;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) dist++;
  }
  return dist;
}

/**
 * Compute the Jaro similarity score between two strings.
 * Returns a value in [0, 1] where 1 means identical.
 *
 * @param {string} a
 * @param {string} b
 * @returns {number} Similarity in [0, 1]
 * @example jaro("MARTHA", "MARHTA"); // ≈ 0.944
 */
export function jaro(a, b) {
  if (a === b) return 1;
  const la = a.length, lb = b.length;
  if (la === 0 || lb === 0) return 0;

  const matchWindow = Math.floor(Math.max(la, lb) / 2) - 1;
  const aMatched = new Array(la).fill(false);
  const bMatched = new Array(lb).fill(false);

  let matches = 0;
  for (let i = 0; i < la; i++) {
    const start = Math.max(0, i - matchWindow);
    const end = Math.min(i + matchWindow + 1, lb);
    for (let j = start; j < end; j++) {
      if (!bMatched[j] && a[i] === b[j]) {
        aMatched[i] = true;
        bMatched[j] = true;
        matches++;
        break;
      }
    }
  }

  if (matches === 0) return 0;

  let transpositions = 0;
  let k = 0;
  for (let i = 0; i < la; i++) {
    if (!aMatched[i]) continue;
    while (!bMatched[k]) k++;
    if (a[i] !== b[k]) transpositions++;
    k++;
  }

  return (matches / la + matches / lb + (matches - transpositions / 2) / matches) / 3;
}

/**
 * Compute the Jaro-Winkler similarity, which gives additional weight to
 * strings that share a common prefix.
 *
 * @param {string} a
 * @param {string} b
 * @param {number} [p=0.1] - Prefix scaling factor (typically 0.1)
 * @returns {number} Similarity in [0, 1]
 * @example jaroWinkler("MARTHA", "MARHTA"); // ≈ 0.961
 */
export function jaroWinkler(a, b, p = 0.1) {
  const jSim = jaro(a, b);
  // Find common prefix length (max 4)
  let prefixLen = 0;
  for (let i = 0; i < Math.min(4, a.length, b.length); i++) {
    if (a[i] === b[i]) prefixLen++; else break;
  }
  return jSim + prefixLen * p * (1 - jSim);
}

/**
 * Compute the Damerau-Levenshtein distance, which extends Levenshtein to
 * also allow transpositions (swapping two adjacent characters) as a
 * single operation.
 *
 * @param {string} a
 * @param {string} b
 * @returns {number} Integer distance (0 = identical)
 * @example damerauLevenshtein("ca", "abc"); // 2
 */
export function damerauLevenshtein(a, b) {
  const m = a.length, n = b.length;
  // Build full (m+1)×(n+1) matrix
  const d = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(
        d[i - 1][j] + 1,       // deletion
        d[i][j - 1] + 1,       // insertion
        d[i - 1][j - 1] + cost // substitution
      );
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + cost); // transposition
      }
    }
  }
  return d[m][n];
}
