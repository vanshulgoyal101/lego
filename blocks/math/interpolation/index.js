/**
 * Numerical Interpolation Methods
 *
 * Provides lerp, bilinear, Lagrange polynomial, and natural cubic spline
 * interpolation — all zero-dependency, pure-JS implementations.
 */

/**
 * Linear interpolation between two values.
 *
 * @param {number} a - Start value (t=0)
 * @param {number} b - End value (t=1)
 * @param {number} t - Interpolation parameter in [0, 1]
 * @returns {number}
 *
 * @example
 * lerp(0, 10, 0.5); // 5
 */
export function lerp(a, b, t) {
  return a + (b - a) * t;
}

/**
 * Bilinear interpolation on a unit square.
 *
 * Interpolates a value at fractional position (x, y) within the unit square
 * [0,1] × [0,1] given values at the four corners.
 *
 * @param {number} x   - Fractional x position in [0, 1]
 * @param {number} y   - Fractional y position in [0, 1]
 * @param {number} q11 - Value at (0, 0)
 * @param {number} q12 - Value at (0, 1)
 * @param {number} q21 - Value at (1, 0)
 * @param {number} q22 - Value at (1, 1)
 * @returns {number}
 */
export function bilinear(x, y, q11, q12, q21, q22) {
  const r1 = lerp(q11, q21, x);
  const r2 = lerp(q12, q22, x);
  return lerp(r1, r2, y);
}

/**
 * Lagrange polynomial interpolation.
 *
 * Constructs and evaluates the unique polynomial of degree ≤ n−1 that passes
 * through all given points. O(n²) per evaluation.
 *
 * @param {{x: number, y: number}[]} points - Known data points
 * @param {number} x - The x-value at which to evaluate
 * @returns {number}
 *
 * @example
 * lagrange([{x:0,y:0},{x:1,y:1},{x:2,y:4}], 1.5); // ≈ 2.25
 */
export function lagrange(points, x) {
  if (points.length === 0) throw new RangeError('interpolation: points array is empty');
  let result = 0;
  for (let i = 0; i < points.length; i++) {
    let term = points[i].y;
    for (let j = 0; j < points.length; j++) {
      if (i !== j) {
        const denom = points[i].x - points[j].x;
        if (denom === 0) throw new Error('interpolation: duplicate x values in points');
        term *= (x - points[j].x) / denom;
      }
    }
    result += term;
  }
  return result;
}

/**
 * Natural cubic spline interpolation.
 *
 * Fits a piecewise cubic polynomial through the given points with natural
 * boundary conditions (second derivative = 0 at endpoints). Evaluates the
 * spline at x using binary search to find the correct segment.
 *
 * @param {{x: number, y: number}[]} points - Known data points, sorted by x
 * @param {number} x - The x-value at which to evaluate
 * @returns {number}
 *
 * @example
 * const pts = [{x:0,y:0},{x:1,y:1},{x:2,y:0},{x:3,y:1}];
 * cubicSpline(pts, 1.5);
 */
export function cubicSpline(points, x) {
  const n = points.length;
  if (n < 2) throw new RangeError('interpolation: cubicSpline needs at least 2 points');

  // Sort points by x just in case
  const pts = [...points].sort((a, b) => a.x - b.x);
  const xs = pts.map(p => p.x);
  const ys = pts.map(p => p.y);

  // Clamp x to the data range
  if (x <= xs[0]) return ys[0];
  if (x >= xs[n - 1]) return ys[n - 1];

  const h = new Array(n - 1);
  for (let i = 0; i < n - 1; i++) h[i] = xs[i + 1] - xs[i];

  // Build tridiagonal system for second derivatives (natural spline: M[0]=M[n-1]=0)
  const alpha = new Array(n).fill(0);
  for (let i = 1; i < n - 1; i++) {
    alpha[i] = (3 / h[i]) * (ys[i + 1] - ys[i]) - (3 / h[i - 1]) * (ys[i] - ys[i - 1]);
  }

  const l = new Array(n).fill(1);
  const mu = new Array(n).fill(0);
  const z = new Array(n).fill(0);

  for (let i = 1; i < n - 1; i++) {
    l[i] = 2 * (xs[i + 1] - xs[i - 1]) - h[i - 1] * mu[i - 1];
    mu[i] = h[i] / l[i];
    z[i] = (alpha[i] - h[i - 1] * z[i - 1]) / l[i];
  }

  // Back-substitution
  const c = new Array(n).fill(0);
  const b = new Array(n - 1);
  const d = new Array(n - 1);

  for (let j = n - 2; j >= 0; j--) {
    c[j] = z[j] - mu[j] * c[j + 1];
    b[j] = (ys[j + 1] - ys[j]) / h[j] - h[j] * (c[j + 1] + 2 * c[j]) / 3;
    d[j] = (c[j + 1] - c[j]) / (3 * h[j]);
  }

  // Find the correct segment (binary search)
  let lo = 0, hi = n - 2;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (xs[mid] <= x) lo = mid; else hi = mid - 1;
  }
  const i = lo;
  const dx = x - xs[i];
  return ys[i] + b[i] * dx + c[i] * dx * dx + d[i] * dx * dx * dx;
}
