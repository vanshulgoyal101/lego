/**
 * Segment Tree Data Structure
 * Supports point updates and range queries (sum/min/max) in O(log n).
 * Includes lazy propagation variant for range updates.
 */

export class SegmentTree {
  /**
   * @param {number[]} array - Input array to build the tree from.
   * @param {'sum'|'min'|'max'} [operation='sum'] - Query operation type.
   */
  constructor(array, operation = 'sum') {
    this.n = array.length;
    this.operation = operation;
    this.tree = new Array(4 * this.n).fill(this._identity());
    this.lazy = new Array(4 * this.n).fill(0);
    if (this.n > 0) this._build(array, 1, 0, this.n - 1);
  }

  _identity() {
    switch (this.operation) {
      case 'min': return Infinity;
      case 'max': return -Infinity;
      default: return 0; // sum
    }
  }

  _combine(a, b) {
    switch (this.operation) {
      case 'min': return Math.min(a, b);
      case 'max': return Math.max(a, b);
      default: return a + b; // sum
    }
  }

  _build(array, node, start, end) {
    if (start === end) {
      this.tree[node] = array[start];
      return;
    }
    const mid = Math.floor((start + end) / 2);
    this._build(array, 2 * node, start, mid);
    this._build(array, 2 * node + 1, mid + 1, end);
    this.tree[node] = this._combine(this.tree[2 * node], this.tree[2 * node + 1]);
  }

  /**
   * Update the value at index i to newValue.
   * @param {number} i - 0-indexed position.
   * @param {number} newValue
   */
  update(i, newValue) {
    this._update(1, 0, this.n - 1, i, newValue);
  }

  _update(node, start, end, i, newValue) {
    if (start === end) {
      this.tree[node] = newValue;
      return;
    }
    const mid = Math.floor((start + end) / 2);
    if (i <= mid) this._update(2 * node, start, mid, i, newValue);
    else this._update(2 * node + 1, mid + 1, end, i, newValue);
    this.tree[node] = this._combine(this.tree[2 * node], this.tree[2 * node + 1]);
  }

  /**
   * Query the aggregated value over range [l, r] (0-indexed, inclusive).
   * @param {number} l - Left boundary.
   * @param {number} r - Right boundary.
   * @returns {number}
   */
  query(l, r) {
    if (l < 0 || r >= this.n || l > r) {
      throw new RangeError(`Invalid query range [${l}, ${r}] for array of size ${this.n}`);
    }
    return this._query(1, 0, this.n - 1, l, r);
  }

  _query(node, start, end, l, r) {
    if (r < start || end < l) return this._identity();
    if (l <= start && end <= r) return this.tree[node];
    const mid = Math.floor((start + end) / 2);
    const leftVal = this._query(2 * node, start, mid, l, r);
    const rightVal = this._query(2 * node + 1, mid + 1, end, l, r);
    return this._combine(leftVal, rightVal);
  }
}

/**
 * Fenwick Tree (Binary Indexed Tree) - simpler alternative for prefix sum queries.
 * Supports point updates and prefix sum queries in O(log n).
 */
export class FenwickTree {
  /**
   * @param {number} n - Size of the array.
   */
  constructor(n) {
    this.n = n;
    this.tree = new Array(n + 1).fill(0);
  }

  /**
   * Add delta to index i (1-indexed).
   * @param {number} i - 1-indexed position.
   * @param {number} delta - Value to add.
   */
  update(i, delta) {
    for (; i <= this.n; i += i & (-i)) {
      this.tree[i] += delta;
    }
  }

  /**
   * Get prefix sum from 1 to i (1-indexed).
   * @param {number} i
   * @returns {number}
   */
  prefixSum(i) {
    let sum = 0;
    for (; i > 0; i -= i & (-i)) {
      sum += this.tree[i];
    }
    return sum;
  }

  /**
   * Get range sum from l to r (1-indexed, inclusive).
   * @param {number} l
   * @param {number} r
   * @returns {number}
   */
  rangeSum(l, r) {
    return this.prefixSum(r) - this.prefixSum(l - 1);
  }
}
