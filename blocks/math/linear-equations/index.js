/**
 * Solve a system of linear equations Ax = B using Gaussian Elimination with partial pivoting
 *
 * @param {number[][]} A - Coeff matrix [N x N]
 * @param {number[]} B - Right hand side vector [N]
 * @returns {number[]} Solution vector x [N]
 */
export function solve(A, B) {
  if (!Array.isArray(A) || !Array.isArray(B)) {
    throw new Error('InvalidInput: Inputs must be arrays.');
  }

  const n = A.length;
  if (B.length !== n) {
    throw new Error('DimensionMismatch: Matrix rows count must match vector length.');
  }

  // Build augmented matrix [A|B]
  const M = A.map((row, i) => {
    if (row.length !== n) {
      throw new Error('InvalidInput: Coefficient matrix A must be square.');
    }
    return [...row, B[i]];
  });

  for (let i = 0; i < n; i++) {
    // 1. Partial pivoting
    let maxRow = i;
    for (let k = i + 1; k < n; k++) {
      if (Math.abs(M[k][i]) > Math.abs(M[maxRow][i])) {
        maxRow = k;
      }
    }

    // Swap row i and maxRow
    const temp = M[i];
    M[i] = M[maxRow];
    M[maxRow] = temp;

    // Check for singular matrix
    if (Math.abs(M[i][i]) < 1e-12) {
      throw new Error('SingularMatrix: System has no unique solution.');
    }

    // 2. Elimination
    for (let k = i + 1; k < n; k++) {
      const factor = M[k][i] / M[i][i];
      for (let j = i; j <= n; j++) {
        M[k][j] -= factor * M[i][j];
      }
    }
  }

  // 3. Back substitution
  const x = new Array(n).fill(0);
  for (let i = n - 1; i >= 0; i--) {
    let sum = M[i][n];
    for (let j = i + 1; j < n; j++) {
      sum -= M[i][j] * x[j];
    }
    x[i] = sum / M[i][i];
  }

  return x;
}
export default solve;
