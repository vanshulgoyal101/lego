/**
 * @module ds/skip-list
 *
 * Probabilistic ordered linked list providing O(log N) average-case
 * search, insert, and delete without requiring tree rotations or rebalancing.
 *
 * Each node is promoted to higher levels with probability `p`, yielding a
 * geometric distribution of heights. The expected number of comparisons
 * per operation is O(log N / log(1/p)).
 */

const DEFAULT_MAX_LEVEL = 16;
const DEFAULT_PROBABILITY = 0.5;

/**
 * A single node in the SkipList, holding a value and an array of forward
 * pointers — one per level the node participates in.
 */
class SkipListNode {
  /**
   * @param {*} value - The value stored by this node.
   * @param {number} level - Number of levels this node spans (1-indexed).
   */
  constructor(value, level) {
    this.value = value;
    /** @type {SkipListNode[]} forward pointers, index 0 = bottom level */
    this.forward = new Array(level).fill(null);
  }
}

/**
 * Probabilistic ordered linked list.
 *
 * @example
 * const sl = new SkipList();
 * sl.insert(3);
 * sl.insert(1);
 * sl.insert(2);
 * sl.toArray(); // [1, 2, 3]
 * sl.search(2); // true
 * sl.delete(2);
 * sl.toArray(); // [1, 3]
 */
export class SkipList {
  /**
   * @param {number} [maxLevel=16] - Maximum number of levels.
   * @param {number} [probability=0.5] - Probability of promoting a node to the next level.
   */
  constructor(maxLevel = DEFAULT_MAX_LEVEL, probability = DEFAULT_PROBABILITY) {
    this.maxLevel = maxLevel;
    this.probability = probability;
    this.currentLevel = 1;

    // Sentinel head node with -Infinity value spanning all levels
    this._head = new SkipListNode(-Infinity, maxLevel);
    this._size = 0;
  }

  /**
   * Randomly determines the level for a new node based on the probability factor.
   * @returns {number} Level count (>= 1, <= maxLevel).
   * @private
   */
  _randomLevel() {
    let level = 1;
    while (Math.random() < this.probability && level < this.maxLevel) {
      level++;
    }
    return level;
  }

  /**
   * Inserts a value into the skip list.
   * Duplicate values are ignored.
   * @param {*} value - Comparable value to insert.
   */
  insert(value) {
    const update = new Array(this.maxLevel).fill(null);
    let current = this._head;

    // Walk from top level down, recording the last node at each level
    for (let i = this.currentLevel - 1; i >= 0; i--) {
      while (current.forward[i] !== null && current.forward[i].value < value) {
        current = current.forward[i];
      }
      update[i] = current;
    }

    // Move to potential existing node
    current = current.forward[0];

    if (current !== null && current.value === value) {
      return; // Duplicate — skip
    }

    const newLevel = this._randomLevel();

    // If new node's level exceeds current max, fill gap with head pointers
    if (newLevel > this.currentLevel) {
      for (let i = this.currentLevel; i < newLevel; i++) {
        update[i] = this._head;
      }
      this.currentLevel = newLevel;
    }

    const newNode = new SkipListNode(value, newLevel);

    // Splice the new node into the list at each level
    for (let i = 0; i < newLevel; i++) {
      newNode.forward[i] = update[i].forward[i];
      update[i].forward[i] = newNode;
    }

    this._size++;
  }

  /**
   * Searches for a value in the skip list.
   * @param {*} value - Value to search for.
   * @returns {boolean} True if the value exists, false otherwise.
   */
  search(value) {
    let current = this._head;

    for (let i = this.currentLevel - 1; i >= 0; i--) {
      while (current.forward[i] !== null && current.forward[i].value < value) {
        current = current.forward[i];
      }
    }

    current = current.forward[0];
    return current !== null && current.value === value;
  }

  /**
   * Deletes a value from the skip list.
   * @param {*} value - Value to remove.
   * @returns {boolean} True if the value was found and removed, false otherwise.
   */
  delete(value) {
    const update = new Array(this.maxLevel).fill(null);
    let current = this._head;

    for (let i = this.currentLevel - 1; i >= 0; i--) {
      while (current.forward[i] !== null && current.forward[i].value < value) {
        current = current.forward[i];
      }
      update[i] = current;
    }

    current = current.forward[0];

    if (current === null || current.value !== value) {
      return false; // Not found
    }

    // Unlink the node from each level
    for (let i = 0; i < this.currentLevel; i++) {
      if (update[i].forward[i] !== current) break;
      update[i].forward[i] = current.forward[i];
    }

    // Shrink current level if top levels are now empty
    while (this.currentLevel > 1 && this._head.forward[this.currentLevel - 1] === null) {
      this.currentLevel--;
    }

    this._size--;
    return true;
  }

  /**
   * Returns all values in the skip list in sorted ascending order.
   * @returns {Array} Sorted array of values.
   */
  toArray() {
    const result = [];
    let current = this._head.forward[0];
    while (current !== null) {
      result.push(current.value);
      current = current.forward[0];
    }
    return result;
  }

  /**
   * Number of values currently stored in the skip list.
   * @type {number}
   */
  get size() {
    return this._size;
  }
}
