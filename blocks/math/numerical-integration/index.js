/**
 * Approximate definite integral using Trapezoidal Rule
 *
 * @param {Function} f - Integrand mathematical function f(x)
 * @param {number} a - Lower bound of interval
 * @param {number} b - Upper bound of interval
 * @param {number} [n=100] - Number of intervals
 * @returns {number} Approximated integral value
 */
export function trapezoidal(f, a, b, n = 100) {
  if (typeof f !== 'function') throw new Error('InvalidInput: f must be a function.');
  const h = (b - a) / n;
  let sum = 0.5 * (f(a) + f(b));
  for (let i = 1; i < n; i++) {
    sum += f(a + i * h);
  }
  return sum * h;
}

/**
 * Approximate definite integral using Simpson's 1/3 Rule
 *
 * @param {Function} f - Integrand mathematical function f(x)
 * @param {number} a - Lower bound of interval
 * @param {number} b - Upper bound of interval
 * @param {number} [n=100] - Number of intervals (will be rounded up to even)
 * @returns {number} Approximated integral value
 */
export function simpson(f, a, b, n = 100) {
  if (typeof f !== 'function') throw new Error('InvalidInput: f must be a function.');
  let numIntervals = n;
  if (numIntervals % 2 !== 0) {
    numIntervals++;
  }
  const h = (b - a) / numIntervals;
  let sum = f(a) + f(b);

  for (let i = 1; i < numIntervals; i++) {
    const x = a + i * h;
    if (i % 2 === 0) {
      sum += 2 * f(x);
    } else {
      sum += 4 * f(x);
    }
  }

  return (sum * h) / 3;
}
export default { trapezoidal, simpson };
