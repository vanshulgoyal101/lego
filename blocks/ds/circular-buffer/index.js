/**
 * A highly performant fixed-size Circular Buffer (Ring Buffer).
 * Useful for telemetry stream sliding logs, data buffering, and sliding window averages.
 */
export class CircularBuffer {
  /**
   * @param {number} capacity - Fixed maximum size allocation of the buffer.
   */
  constructor(capacity) {
    if (capacity <= 0) {
      throw new Error('Capacity must be greater than 0');
    }
    this.capacity = capacity;
    this.buffer = new Array(capacity);
    this.head = 0;
    this.tail = 0;
    this.size = 0;
  }

  /**
   * Check if the buffer is empty.
   * @returns {boolean}
   */
  isEmpty() {
    return this.size === 0;
  }

  /**
   * Check if the buffer is full.
   * @returns {boolean}
   */
  isFull() {
    return this.size === this.capacity;
  }

  /**
   * Push a value into the buffer.
   * If the buffer is full, the oldest value is overwritten.
   * @param {*} value
   */
  push(value) {
    this.buffer[this.tail] = value;
    this.tail = (this.tail + 1) % this.capacity;

    if (this.isFull()) {
      // Overwrite oldest item: shift head forward
      this.head = (this.head + 1) % this.capacity;
    } else {
      this.size++;
    }
  }

  /**
   * Retrieve and remove the oldest value from the buffer (FIFO).
   * @returns {*} Oldest value, or undefined if empty.
   */
  poll() {
    if (this.isEmpty()) {
      return undefined;
    }

    const value = this.buffer[this.head];
    this.buffer[this.head] = undefined; // Clear reference
    this.head = (this.head + 1) % this.capacity;
    this.size--;

    return value;
  }

  /**
   * Peek at the oldest value in the buffer without removing it.
   * @returns {*} Oldest value.
   */
  peek() {
    if (this.isEmpty()) {
      return undefined;
    }
    return this.buffer[this.head];
  }

  /**
   * Convert buffer contents to a standard ordered array.
   * @returns {Array} List of items ordered from oldest to newest.
   */
  toArray() {
    const arr = [];
    let current = this.head;
    for (let i = 0; i < this.size; i++) {
      arr.push(this.buffer[current]);
      current = (current + 1) % this.capacity;
    }
    return arr;
  }

  /**
   * Reset / clear the buffer.
   */
  clear() {
    this.buffer = new Array(this.capacity);
    this.head = 0;
    this.tail = 0;
    this.size = 0;
  }
}
