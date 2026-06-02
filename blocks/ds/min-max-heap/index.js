/**
 * Double-ended Priority Queue using a Min-Max Heap structure
 */
export class MinMaxHeap {
  constructor() {
    this.heap = [];
  }

  /**
   * Return size of heap
   * @returns {number}
   */
  size() {
    return this.heap.length;
  }

  /**
   * Return minimum element without removing it
   * @returns {*}
   */
  peekMin() {
    return this.heap[0];
  }

  /**
   * Return maximum element without removing it
   * @returns {*}
   */
  peekMax() {
    if (this.heap.length === 0) return undefined;
    if (this.heap.length === 1) return this.heap[0];
    if (this.heap.length === 2) return this.heap[1];
    return this.heap[1] > this.heap[2] ? this.heap[1] : this.heap[2];
  }

  _isMinLevel(index) {
    const level = Math.floor(Math.log2(index + 1));
    return level % 2 === 0;
  }

  /**
   * Push a new element into heap
   * @param {*} val
   */
  push(val) {
    this.heap.push(val);
    this._siftUp(this.heap.length - 1);
  }

  _siftUp(i) {
    if (i === 0) return;
    const parent = Math.floor((i - 1) / 2);
    if (this._isMinLevel(i)) {
      if (this.heap[i] > this.heap[parent]) {
        this._swap(i, parent);
        this._siftUpMax(parent);
      } else {
        this._siftUpMin(i);
      }
    } else {
      if (this.heap[i] < this.heap[parent]) {
        this._swap(i, parent);
        this._siftUpMin(parent);
      } else {
        this._siftUpMax(i);
      }
    }
  }

  _siftUpMin(i) {
    if (i < 3) return;
    const grandparent = Math.floor((Math.floor((i - 1) / 2) - 1) / 2);
    if (this.heap[i] < this.heap[grandparent]) {
      this._swap(i, grandparent);
      this._siftUpMin(grandparent);
    }
  }

  _siftUpMax(i) {
    if (i < 3) return;
    const grandparent = Math.floor((Math.floor((i - 1) / 2) - 1) / 2);
    if (this.heap[i] > this.heap[grandparent]) {
      this._swap(i, grandparent);
      this._siftUpMax(grandparent);
    }
  }

  _swap(a, b) {
    const temp = this.heap[a];
    this.heap[a] = this.heap[b];
    this.heap[b] = temp;
  }

  /**
   * Extract and return minimum element
   * @returns {*}
   */
  popMin() {
    if (this.heap.length === 0) return undefined;
    const min = this.heap[0];
    const last = this.heap.pop();
    if (this.heap.length > 0) {
      this.heap[0] = last;
      this._siftDown(0);
    }
    return min;
  }

  /**
   * Extract and return maximum element
   * @returns {*}
   */
  popMax() {
    if (this.heap.length === 0) return undefined;
    if (this.heap.length === 1) return this.heap.pop();

    let maxIdx = 1;
    if (this.heap.length > 2 && this.heap[2] > this.heap[1]) {
      maxIdx = 2;
    }

    const max = this.heap[maxIdx];
    const last = this.heap.pop();
    if (this.heap.length > maxIdx) {
      this.heap[maxIdx] = last;
      this._siftDown(maxIdx);
    }
    return max;
  }

  _siftDown(i) {
    if (this._isMinLevel(i)) {
      this._siftDownMin(i);
    } else {
      this._siftDownMax(i);
    }
  }

  _descendants(i) {
    const list = [];
    const left = 2 * i + 1;
    const right = 2 * i + 2;
    if (left < this.heap.length) {
      list.push(left);
      const lLeft = 2 * left + 1;
      const lRight = 2 * left + 2;
      if (lLeft < this.heap.length) list.push(lLeft);
      if (lRight < this.heap.length) list.push(lRight);
    }
    if (right < this.heap.length) {
      list.push(right);
      const rLeft = 2 * right + 1;
      const rRight = 2 * right + 2;
      if (rLeft < this.heap.length) list.push(rLeft);
      if (rRight < this.heap.length) list.push(rRight);
    }
    return list;
  }

  _siftDownMin(i) {
    const desc = this._descendants(i);
    if (desc.length === 0) return;

    let m = desc[0];
    for (let idx = 1; idx < desc.length; idx++) {
      if (this.heap[desc[idx]] < this.heap[m]) {
        m = desc[idx];
      }
    }

    const isGrandchild = m >= 2 * i + 3;
    if (isGrandchild) {
      if (this.heap[m] < this.heap[i]) {
        this._swap(m, i);
        const parent = Math.floor((m - 1) / 2);
        if (this.heap[m] > this.heap[parent]) {
          this._swap(m, parent);
        }
        this._siftDownMin(m);
      }
    } else {
      if (this.heap[m] < this.heap[i]) {
        this._swap(m, i);
      }
    }
  }

  _siftDownMax(i) {
    const desc = this._descendants(i);
    if (desc.length === 0) return;

    let m = desc[0];
    for (let idx = 1; idx < desc.length; idx++) {
      if (this.heap[desc[idx]] > this.heap[m]) {
        m = desc[idx];
      }
    }

    const isGrandchild = m >= 2 * i + 3;
    if (isGrandchild) {
      if (this.heap[m] > this.heap[i]) {
        this._swap(m, i);
        const parent = Math.floor((m - 1) / 2);
        if (this.heap[m] < this.heap[parent]) {
          this._swap(m, parent);
        }
        this._siftDownMax(m);
      }
    } else {
      if (this.heap[m] > this.heap[i]) {
        this._swap(m, i);
      }
    }
  }
}
