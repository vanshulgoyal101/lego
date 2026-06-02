/**
 * @module ds/sparse-table
 *
 * Static Range Minimum/Maximum Query (RMQ) data structure.
 *
 * Builds in O(N log N) time and space, then answers range queries in O(1)
 * by exploiting the idempotency of min/max: any range [l, r] can be
 * covered by two (possibly overlapping) pre-computed blocks of size 2^k.
 *
 * The table is immutable after construction — mutations to the source array
 * are not reflected. Construct a new SparseTable if the data changes.
 */

/**
 * Sparse table for O(1) range min or max queries on a static numeric array.
 *
 * @example
 * const st = new SparseTable([3, 1, 4, 1, 5, 9, 2, 6], 'min');
 * st.query(1, 5); // 1  (min of indices 1..5)
 *
 * const stMax = new SparseTable([3, 1, 4, 1, 5, 9, 2, 6], 'max');
 * stMax.query(2, 6); // 9
 */
export class SparseTable {
  /**
   * Builds the sparse table.
   * @param {number[]} array - Source array of numbers. Must be non-empty.
   * @param {'min'|'max'} mode - Whether to answer range minimum or range maximum queries.
   * @throws {Error} If the array is empty or mode is invalid.
   */
  constructor(array, mode) {
    if (!array || array.length === 0) {
      throw new Error('SparseTable requires a non-empty array.');
    }
    if (mode !== 'min' && mode !== 'max') {
      throw new Error("mode must be 'min' or 'max'.");
    }

    this._mode = mode;
    this._n = array.length;
    this._compare = mode === 'min'
      ? (a, b) => (a <= b ? a : b)
      : (a, b) => (a >= b ? a : b);

    // Precompute floor(log2) for each index for O(1) lookup during query
    this._log2 = new Int32Array(this._n + 1);
    this._log2[1] = 0;
    for (let i = 2; i <= this._n; i++) {
      this._log2[i] = this._log2[i >> 1] + 1;
    }

    const k = this._log2[this._n] + 1;

    // table[j][i] = min/max of array[i .. i + 2^j - 1]
    this._table = [];
    this._table[0] = Float64Array.from(array);

    for (let j = 1; j < k; j++) {
      const prev = this._table[j - 1];
      const len = this._n - (1 << j) + 1;
      const cur = new Float64Array(len);
      for (let i = 0; i < len; i++) {
        cur[i] = this._compare(prev[i], prev[i + (1 << (j - 1))]);
      }
      this._table[j] = cur;
    }
  }

  /**
   * Queries the minimum or maximum value over the closed range [l, r].
   * @param {number} l - Left index (inclusive, 0-based).
   * @param {number} r - Right index (inclusive, 0-based).
   * @returns {number} The min or max value in array[l..r].
   * @throws {Error} If indices are out of bounds or l > r.
   */
  query(l, r) {
    if (l < 0 || r >= this._n || l > r) {
      throw new Error(`Invalid query range [${l}, ${r}] for array of length ${this._n}.`);
    }
    const k = this._log2[r - l + 1];
    return this._compare(this._table[k][l], this._table[k][r - (1 << k) + 1]);
  }

  /**
   * The number of elements in the underlying array.
   * @type {number}
   */
  get length() {
    return this._n;
  }

  /**
   * The query mode ('min' or 'max').
   * @type {string}
   */
  get mode() {
    return this._mode;
  }
}
