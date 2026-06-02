/**
 * A line-by-line text difference engine.
 * Computes difference deltas between two strings using Longest Common Subsequence (LCS).
 */

/**
 * Compare two text strings and return an array of diff actions.
 * @param {string} text1 - Original text.
 * @param {string} text2 - Modified text.
 * @returns {Array<{ type: 'added'|'removed'|'unchanged', value: string }>} Diff entries.
 */
export function diffLines(text1, text2) {
  const lines1 = text1.split(/\r?\n/);
  const lines2 = text2.split(/\r?\n/);

  const m = lines1.length;
  const n = lines2.length;

  // Build the LCS dynamic programming table
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (lines1[i - 1] === lines2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  // Backtrack to assemble the diff result in reverse
  const result = [];
  let i = m;
  let j = n;

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && lines1[i - 1] === lines2[j - 1]) {
      result.unshift({ type: 'unchanged', value: lines1[i - 1] });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      result.unshift({ type: 'added', value: lines2[j - 1] });
      j--;
    } else if (i > 0 && (j === 0 || dp[i - 1][j] >= dp[i][j - 1])) {
      result.unshift({ type: 'removed', value: lines1[i - 1] });
      i--;
    }
  }

  return result;
}
