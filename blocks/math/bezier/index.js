/**
 * Compute quadratic Bezier point at interval parameter t
 *
 * @param {number[]} p0 - Start point [x, y]
 * @param {number[]} p1 - Control point [x, y]
 * @param {number[]} p2 - End point [x, y]
 * @param {number} t - Parameter in range [0, 1]
 * @returns {number[]} Calculated coordinates [x, y]
 */
export function quadratic(p0, p1, p2, t) {
  const x = (1 - t) ** 2 * p0[0] + 2 * (1 - t) * t * p1[0] + t ** 2 * p2[0];
  const y = (1 - t) ** 2 * p0[1] + 2 * (1 - t) * t * p1[1] + t ** 2 * p2[1];
  return [x, y];
}

/**
 * Compute cubic Bezier point at interval parameter t
 *
 * @param {number[]} p0 - Start point
 * @param {number[]} p1 - Control point 1
 * @param {number[]} p2 - Control point 2
 * @param {number[]} p3 - End point
 * @param {number} t - Parameter in range [0, 1]
 * @returns {number[]} Calculated coordinates [x, y]
 */
export function cubic(p0, p1, p2, p3, t) {
  const x = (1 - t) ** 3 * p0[0] + 3 * (1 - t) ** 2 * t * p1[0] + 3 * (1 - t) * t ** 2 * p2[0] + t ** 3 * p3[0];
  const y = (1 - t) ** 3 * p0[1] + 3 * (1 - t) ** 2 * t * p1[1] + 3 * (1 - t) * t ** 2 * p2[1] + t ** 3 * p3[1];
  return [x, y];
}

/**
 * Generic De Casteljau evaluation algorithm for arbitrary control points count
 *
 * @param {number[][]} points - Control points coordinates array
 * @param {number} t - Parameter in range [0, 1]
 * @returns {number[]} Calculated coordinates [x, y]
 */
export function deCasteljau(points, t) {
  let temp = points.map(p => [...p]);
  while (temp.length > 1) {
    const next = [];
    for (let i = 0; i < temp.length - 1; i++) {
      const x = (1 - t) * temp[i][0] + t * temp[i + 1][0];
      const y = (1 - t) * temp[i][1] + t * temp[i + 1][1];
      next.push([x, y]);
    }
    temp = next;
  }
  return temp[0];
}

/**
 * Generate discrete sequence of curve coordinate points
 *
 * @param {number[][]} controlPoints - Array of control point coordinates
 * @param {number} [numSamples=100] - Total step partitions count
 * @returns {number[][]} Sampled coordinates list along the curve
 */
export function generateCurve(controlPoints, numSamples = 100) {
  const points = [];
  const n = controlPoints.length;
  if (n < 2) return controlPoints;

  for (let i = 0; i <= numSamples; i++) {
    const t = i / numSamples;
    if (n === 3) {
      points.push(quadratic(controlPoints[0], controlPoints[1], controlPoints[2], t));
    } else if (n === 4) {
      points.push(cubic(controlPoints[0], controlPoints[1], controlPoints[2], controlPoints[3], t));
    } else {
      points.push(deCasteljau(controlPoints, t));
    }
  }
  return points;
}
export default { quadratic, cubic, deCasteljau, generateCurve };
