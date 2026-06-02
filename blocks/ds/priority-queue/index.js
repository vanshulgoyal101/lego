/**
 * A highly efficient binary heap-based Priority Queue.
 * Supports custom item types and custom sorting comparator functions.
 */
export class PriorityQueue {
  /**
   * @param {Function} [comparator] - Function to compare elements. Defaults to min-heap behavior.
   *   (a, b) => a - b. If returned value is negative, a has higher priority.
   */
  constructor(comparator = (a, b) => a - b) {
    this.heap = [];
    this.comparator = comparator;
  }

  /**
   * Returns the number of items in the queue.
   * @returns {number}
   */
  size() {
    return this.heap.length;
  }

  /**
   * Check if the queue is empty.
   * @returns {boolean}
   */
  isEmpty() {
    return this.heap.length === 0;
  }

  /**
   * Peek at the highest priority item without removing it.
   * @returns {*} Highest priority item.
   */
  peek() {
    return this.heap[0];
  }

  /**
   * Add a new item to the priority queue.
   * @param {*} item
   */
  enqueue(item) {
    this.heap.push(item);
    this._bubbleUp(this.heap.length - 1);
  }

  /**
   * Remove and return the highest priority item.
   * @returns {*} Highest priority item.
   */
  dequeue() {
    if (this.isEmpty()) {
      return undefined;
    }
    const top = this.heap[0];
    const bottom = this.heap.pop();
    if (this.heap.length > 0) {
      this.heap[0] = bottom;
      this._sinkDown(0);
    }
    return top;
  }

  /**
   * Internal bubble-up sorting.
   * @private
   */
  _bubbleUp(index) {
    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2);
      if (this.comparator(this.heap[index], this.heap[parentIndex]) >= 0) {
        break;
      }
      this._swap(index, parentIndex);
      index = parentIndex;
    }
  }

  /**
   * Internal sink-down sorting.
   * @private
   */
  _sinkDown(index) {
    const length = this.heap.length;
    const element = this.heap[index];

    while (true) {
      let leftChildIndex = 2 * index + 1;
      let rightChildIndex = 2 * index + 2;
      let leftChild, rightChild;
      let swapIndex = null;

      if (leftChildIndex < length) {
        leftChild = this.heap[leftChildIndex];
        if (this.comparator(leftChild, element) < 0) {
          swapIndex = leftChildIndex;
        }
      }

      if (rightChildIndex < length) {
        rightChild = this.heap[rightChildIndex];
        if (
          (swapIndex === null && this.comparator(rightChild, element) < 0) ||
          (swapIndex !== null && this.comparator(rightChild, leftChild) < 0)
        ) {
          swapIndex = rightChildIndex;
        }
      }

      if (swapIndex === null) {
        break;
      }

      this._swap(index, swapIndex);
      index = swapIndex;
    }
  }

  /**
   * Internal swap helper.
   * @private
   */
  _swap(i, j) {
    const temp = this.heap[i];
    this.heap[i] = this.heap[j];
    this.heap[j] = temp;
  }
}
