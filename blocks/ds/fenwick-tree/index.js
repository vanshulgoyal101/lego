/**
 * Fenwick Tree (Binary Indexed Tree)
 * One-based indexing internal structure representation.
 */
export class FenwickTree {
  /**
   * @param {number|number[]} sizeOrArray - Buffer size or array to initialize tree values
   */
  constructor(sizeOrArray) {
    if (Array.isArray(sizeOrArray)) {
      this.size = sizeOrArray.length;
      this.tree = new Array(this.size + 1).fill(0);
      for (let i = 0; i < this.size; i++) {
        this.add(i, sizeOrArray[i]);
      }
    } else {
      this.size = sizeOrArray;
      this.tree = new Array(this.size + 1).fill(0);
    }
  }

  /**
   * Adds value delta at index (zero-based index)
   *
   * @param {number} idx
   * @param {number} delta
   */
  add(idx, delta) {
    let i = idx + 1; // Convert to 1-based indexing
    while (i <= this.size) {
      this.tree[i] += delta;
      i += i & -i; // Move to next node
    }
  }

  /**
   * Returns query sum of range [0, idx]
   *
   * @param {number} idx
   * @returns {number} sum
   */
  query(idx) {
    let sum = 0;
    let i = idx + 1; // Convert to 1-based indexing
    while (i > 0) {
      sum += this.tree[i];
      i -= i & -i; // Move to parent
    }
    return sum;
  }

  /**
   * Returns query sum of range [left, right] inclusive
   *
   * @param {number} left
   * @param {number} right
   * @returns {number} sum
   */
  queryRange(left, right) {
    if (left > right) return 0;
    return this.query(right) - this.query(left - 1);
  }
}
