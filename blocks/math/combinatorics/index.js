/**
 * Combinatorial Math Utilities
 *
 * Zero-dependency implementations of common combinatorics functions:
 * factorial, binomial coefficients, permutations, combinations,
 * Cartesian product, and power set.
 */

/**
 * Compute n! (factorial) for a non-negative integer n.
 * Returns a BigInt for n > 18 to avoid precision loss.
 *
 * @param {number} n - Non-negative integer
 * @returns {number|BigInt}
 * @example factorial(5); // 120
 */
export function factorial(n) {
  if (!Number.isInteger(n) || n < 0) {
    throw new RangeError('factorial: n must be a non-negative integer');
  }
  if (n > 18) {
    // Use BigInt for large values
    let r = 1n;
    for (let i = 2n; i <= BigInt(n); i++) r *= i;
    return r;
  }
  let r = 1;
  for (let i = 2; i <= n; i++) r *= i;
  return r;
}

/**
 * Compute the binomial coefficient C(n, k) = n! / (k! * (n-k)!).
 * Uses a multiplicative formula to avoid computing large factorials.
 *
 * @param {number} n - Total elements
 * @param {number} k - Elements chosen
 * @returns {number}
 * @example choose(5, 2); // 10
 */
export function choose(n, k) {
  if (!Number.isInteger(n) || !Number.isInteger(k) || n < 0 || k < 0) {
    throw new RangeError('choose: n and k must be non-negative integers');
  }
  if (k > n) return 0;
  if (k === 0 || k === n) return 1;
  k = Math.min(k, n - k); // exploit symmetry
  let result = 1;
  for (let i = 0; i < k; i++) {
    result = result * (n - i) / (i + 1);
  }
  return Math.round(result);
}

/**
 * Generate all permutations of an array (order matters, no repetition).
 * Returns an array of arrays. Time complexity: O(n! * n).
 *
 * @template T
 * @param {T[]} arr - Input array
 * @returns {T[][]}
 * @example permutations([1,2,3]); // [[1,2,3],[1,3,2],[2,1,3],...]
 */
export function permutations(arr) {
  const result = [];
  function permute(current, remaining) {
    if (remaining.length === 0) {
      result.push(current);
      return;
    }
    for (let i = 0; i < remaining.length; i++) {
      permute(
        [...current, remaining[i]],
        [...remaining.slice(0, i), ...remaining.slice(i + 1)]
      );
    }
  }
  permute([], arr);
  return result;
}

/**
 * Generate all k-element combinations of an array (order does not matter).
 *
 * @template T
 * @param {T[]} arr - Input array
 * @param {number} k - Combination size
 * @returns {T[][]}
 * @example combinations([1,2,3,4], 2); // [[1,2],[1,3],[1,4],[2,3],[2,4],[3,4]]
 */
export function combinations(arr, k) {
  const result = [];
  function combine(start, current) {
    if (current.length === k) {
      result.push([...current]);
      return;
    }
    for (let i = start; i < arr.length; i++) {
      current.push(arr[i]);
      combine(i + 1, current);
      current.pop();
    }
  }
  combine(0, []);
  return result;
}

/**
 * Compute the Cartesian product of multiple arrays.
 * Returns all tuples with one element from each array.
 *
 * @param {...Array} arrays - Two or more arrays
 * @returns {Array[]}
 * @example cartesianProduct([1,2], ['a','b']); // [[1,'a'],[1,'b'],[2,'a'],[2,'b']]
 */
export function cartesianProduct(...arrays) {
  if (arrays.length === 0) return [[]];
  return arrays.reduce((acc, arr) => {
    const result = [];
    for (const a of acc) {
      for (const b of arr) {
        result.push([...a, b]);
      }
    }
    return result;
  }, [[]]);
}

/**
 * Generate all subsets (power set) of an array, including the empty set.
 * Result contains 2^n subsets.
 *
 * @template T
 * @param {T[]} arr - Input array
 * @returns {T[][]}
 * @example powerSet([1,2]); // [[], [1], [2], [1,2]]
 */
export function powerSet(arr) {
  const result = [[]];
  for (const item of arr) {
    const newSubsets = result.map(subset => [...subset, item]);
    result.push(...newSubsets);
  }
  return result;
}
