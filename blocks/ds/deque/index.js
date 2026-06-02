/**
 * @module ds/deque
 *
 * Double-ended queue (deque) backed by a doubly linked list.
 * All push/pop/peek operations at both ends run in O(1) time.
 * Unlike a circular buffer, the deque grows without bounds and
 * never requires resizing.
 */

/**
 * Internal doubly linked list node.
 * @private
 */
class DequeNode {
  constructor(value) {
    this.value = value;
    /** @type {DequeNode|null} */
    this.prev = null;
    /** @type {DequeNode|null} */
    this.next = null;
  }
}

/**
 * Double-ended queue with O(1) operations at both ends.
 *
 * @example
 * const dq = new Deque();
 * dq.pushBack(1);
 * dq.pushBack(2);
 * dq.pushFront(0);
 * dq.peekFront(); // 0
 * dq.peekBack();  // 2
 * dq.popFront();  // 0
 * dq.popBack();   // 2
 * dq.size();      // 1
 */
export class Deque {
  constructor() {
    /** @type {DequeNode|null} */
    this._head = null;
    /** @type {DequeNode|null} */
    this._tail = null;
    this._size = 0;
  }

  /**
   * Inserts a value at the front of the deque.
   * @param {*} val - Value to insert.
   */
  pushFront(val) {
    const node = new DequeNode(val);
    if (this._head === null) {
      this._head = node;
      this._tail = node;
    } else {
      node.next = this._head;
      this._head.prev = node;
      this._head = node;
    }
    this._size++;
  }

  /**
   * Inserts a value at the back of the deque.
   * @param {*} val - Value to insert.
   */
  pushBack(val) {
    const node = new DequeNode(val);
    if (this._tail === null) {
      this._head = node;
      this._tail = node;
    } else {
      node.prev = this._tail;
      this._tail.next = node;
      this._tail = node;
    }
    this._size++;
  }

  /**
   * Removes and returns the front value.
   * @returns {*} The front value, or undefined if the deque is empty.
   */
  popFront() {
    if (this._head === null) return undefined;
    const val = this._head.value;
    this._head = this._head.next;
    if (this._head !== null) {
      this._head.prev = null;
    } else {
      this._tail = null;
    }
    this._size--;
    return val;
  }

  /**
   * Removes and returns the back value.
   * @returns {*} The back value, or undefined if the deque is empty.
   */
  popBack() {
    if (this._tail === null) return undefined;
    const val = this._tail.value;
    this._tail = this._tail.prev;
    if (this._tail !== null) {
      this._tail.next = null;
    } else {
      this._head = null;
    }
    this._size--;
    return val;
  }

  /**
   * Returns the front value without removing it.
   * @returns {*} The front value, or undefined if empty.
   */
  peekFront() {
    return this._head !== null ? this._head.value : undefined;
  }

  /**
   * Returns the back value without removing it.
   * @returns {*} The back value, or undefined if empty.
   */
  peekBack() {
    return this._tail !== null ? this._tail.value : undefined;
  }

  /**
   * Returns the number of elements currently in the deque.
   * @returns {number}
   */
  size() {
    return this._size;
  }

  /**
   * Returns true if the deque has no elements.
   * @returns {boolean}
   */
  isEmpty() {
    return this._size === 0;
  }

  /**
   * Returns all elements from front to back as an array.
   * @returns {Array}
   */
  toArray() {
    const result = [];
    let current = this._head;
    while (current !== null) {
      result.push(current.value);
      current = current.next;
    }
    return result;
  }
}
