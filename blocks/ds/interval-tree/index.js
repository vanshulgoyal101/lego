/**
 * @module ds/interval-tree
 *
 * Augmented Binary Search Tree that stores intervals [start, end] and
 * supports efficient overlap queries.
 *
 * Each node stores the maximum endpoint (`maxEnd`) of all intervals in its
 * subtree, allowing the search to prune entire subtrees that cannot overlap
 * the query in O(log N) time for single-result queries, O(k log N) for
 * reporting all k overlapping intervals.
 *
 * Intervals are stored sorted by their start value.
 */

/**
 * @typedef {Object} Interval
 * @property {number} start - Left endpoint (inclusive).
 * @property {number} end   - Right endpoint (inclusive).
 * @property {*}      [data] - Optional associated payload.
 */

/** @private */
class ITNode {
  /**
   * @param {number} start
   * @param {number} end
   * @param {*} data
   */
  constructor(start, end, data) {
    this.start = start;
    this.end = end;
    this.data = data;
    this.maxEnd = end;
    /** @type {ITNode|null} */
    this.left = null;
    /** @type {ITNode|null} */
    this.right = null;
  }
}

/**
 * Interval tree supporting point stabs and range overlap queries.
 *
 * @example
 * const tree = new IntervalTree();
 * tree.insert(1, 5, 'A');
 * tree.insert(3, 8, 'B');
 * tree.insert(10, 15, 'C');
 * tree.query(4);      // [{start:1,end:5,data:'A'},{start:3,end:8,data:'B'}]
 * tree.queryRange(6, 11); // [{start:3,end:8,data:'B'},{start:10,end:15,data:'C'}]
 */
export class IntervalTree {
  constructor() {
    /** @type {ITNode|null} */
    this._root = null;
  }

  /**
   * Inserts an interval into the tree.
   * @param {number} start - Left endpoint.
   * @param {number} end   - Right endpoint. Must be >= start.
   * @param {*} [data]     - Optional payload.
   */
  insert(start, end, data = null) {
    this._root = this._insert(this._root, start, end, data);
  }

  /** @private */
  _insert(node, start, end, data) {
    if (node === null) return new ITNode(start, end, data);
    if (start < node.start || (start === node.start && end < node.end)) {
      node.left = this._insert(node.left, start, end, data);
    } else {
      node.right = this._insert(node.right, start, end, data);
    }
    // Update maxEnd on the way back up
    node.maxEnd = Math.max(node.end, node.maxEnd,
      node.left ? node.left.maxEnd : -Infinity,
      node.right ? node.right.maxEnd : -Infinity);
    return node;
  }

  /**
   * Returns all intervals that contain the given point (point stab query).
   * @param {number} point - The query point.
   * @returns {Interval[]} All intervals [start, end] where start <= point <= end.
   */
  query(point) {
    const results = [];
    this._queryPoint(this._root, point, results);
    return results;
  }

  /** @private */
  _queryPoint(node, point, results) {
    if (node === null) return;
    // Prune: if maxEnd < point, no interval in this subtree can contain point
    if (node.maxEnd < point) return;

    this._queryPoint(node.left, point, results);

    if (node.start <= point && point <= node.end) {
      results.push({ start: node.start, end: node.end, data: node.data });
    }

    // Prune right subtree if node.start > point (BST ordering)
    if (node.start <= point) {
      this._queryPoint(node.right, point, results);
    }
  }

  /**
   * Returns all intervals that overlap with [start, end].
   * Two intervals overlap if they share at least one point.
   * @param {number} start - Query range left endpoint.
   * @param {number} end   - Query range right endpoint.
   * @returns {Interval[]} All overlapping intervals.
   */
  queryRange(start, end) {
    const results = [];
    this._queryRange(this._root, start, end, results);
    return results;
  }

  /** @private */
  _queryRange(node, start, end, results) {
    if (node === null) return;
    if (node.maxEnd < start) return; // Entire subtree ends before query start

    this._queryRange(node.left, start, end, results);

    // Overlap condition: not (node.end < start || node.start > end)
    if (!(node.end < start || node.start > end)) {
      results.push({ start: node.start, end: node.end, data: node.data });
    }

    if (node.start <= end) {
      this._queryRange(node.right, start, end, results);
    }
  }

  /**
   * Deletes the first interval found that exactly matches [start, end].
   * If multiple identical intervals exist, only one is removed.
   * @param {number} start - Left endpoint to match.
   * @param {number} end   - Right endpoint to match.
   * @returns {boolean} True if an interval was found and removed.
   */
  delete(start, end) {
    let deleted = false;
    this._root = this._delete(this._root, start, end, () => { deleted = true; });
    return deleted;
  }

  /** @private */
  _delete(node, start, end, onDelete) {
    if (node === null) return null;

    if (start < node.start || (start === node.start && end < node.end)) {
      node.left = this._delete(node.left, start, end, onDelete);
    } else if (start > node.start || (start === node.start && end > node.end)) {
      node.right = this._delete(node.right, start, end, onDelete);
    } else {
      // Found the node to delete
      onDelete();
      if (node.left === null) return node.right;
      if (node.right === null) return node.left;

      // Replace with in-order successor (leftmost in right subtree)
      let successor = node.right;
      while (successor.left !== null) successor = successor.left;
      node.start = successor.start;
      node.end = successor.end;
      node.data = successor.data;
      node.right = this._delete(node.right, successor.start, successor.end, () => {});
    }

    node.maxEnd = Math.max(node.end,
      node.left ? node.left.maxEnd : -Infinity,
      node.right ? node.right.maxEnd : -Infinity);
    return node;
  }
}
