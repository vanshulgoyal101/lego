/**
 * @module algo/knapsack
 *
 * 0/1 Knapsack problem solver using bottom-up dynamic programming.
 *
 * Given a weight capacity and a list of items (each with a weight and value),
 * determines the subset of items that maximises total value without exceeding
 * the capacity. Each item can be taken at most once (0/1 constraint).
 *
 * Time complexity:  O(capacity × items.length)
 * Space complexity: O(capacity × items.length) for DP table + O(items.length)
 *   for backtracking. A 1-D rolling array optimisation is used for the DP
 *   computation but the full table is retained only during item selection.
 *
 * Weights and capacities are rounded to integers internally; use a scaling
 * factor if your inputs have fractional weights.
 */

/**
 * @typedef {Object} KnapsackItem
 * @property {number} weight - Non-negative integer weight of the item.
 * @property {number} value  - Non-negative value of the item.
 * @property {string} [name] - Optional human-readable label.
 */

/**
 * @typedef {Object} KnapsackResult
 * @property {number}          maxValue      - Maximum achievable total value.
 * @property {KnapsackItem[]}  selectedItems - The subset of items chosen.
 */

/**
 * Solves the 0/1 Knapsack problem via dynamic programming.
 *
 * @param {number}         capacity - Maximum total weight the knapsack can hold. Must be >= 0.
 * @param {KnapsackItem[]} items    - Array of items to choose from.
 * @returns {KnapsackResult} The maximum value and the list of selected items.
 *
 * @example
 * knapsack(50, [
 *   { weight: 10, value: 60, name: 'Gold' },
 *   { weight: 20, value: 100, name: 'Silver' },
 *   { weight: 30, value: 120, name: 'Bronze' },
 * ]);
 * // { maxValue: 220, selectedItems: [{name:'Silver',...},{name:'Bronze',...}] }
 */
export function knapsack(capacity, items) {
  const cap = Math.floor(capacity);
  if (cap < 0) throw new Error('capacity must be non-negative');
  if (!Array.isArray(items) || items.length === 0) {
    return { maxValue: 0, selectedItems: [] };
  }

  const n = items.length;

  // Build full 2-D DP table for backtracking
  // dp[i][w] = max value using items 0..i-1 with weight limit w
  const dp = Array.from({ length: n + 1 }, () => new Float64Array(cap + 1));

  for (let i = 1; i <= n; i++) {
    const { weight, value } = items[i - 1];
    const w = Math.floor(weight);
    const v = value;
    for (let c = 0; c <= cap; c++) {
      if (w > c) {
        dp[i][c] = dp[i - 1][c];
      } else {
        const withItem = dp[i - 1][c - w] + v;
        dp[i][c] = withItem > dp[i - 1][c] ? withItem : dp[i - 1][c];
      }
    }
  }

  // Backtrack to find selected items
  const selectedItems = [];
  let c = cap;
  for (let i = n; i >= 1; i--) {
    if (dp[i][c] !== dp[i - 1][c]) {
      selectedItems.push(items[i - 1]);
      c -= Math.floor(items[i - 1].weight);
    }
  }
  selectedItems.reverse();

  return { maxValue: dp[n][cap], selectedItems };
}
