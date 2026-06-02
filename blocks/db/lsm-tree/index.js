class SSTable {
  constructor(id, data) {
    this.id = id;
    // data is a sorted list of [key, value] pairs
    this.data = data.sort((a, b) => a[0].localeCompare(b[0]));
  }

  get(key) {
    // Binary search for key
    let low = 0;
    let high = this.data.length - 1;
    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      const midKey = this.data[mid][0];
      if (midKey === key) {
        return this.data[mid][1];
      } else if (midKey < key) {
        low = mid + 1;
      } else {
        high = mid - 1;
      }
    }
    return undefined;
  }
}

export class LSMTree {
  /**
   * @param {Object} [options={}]
   * @param {number} [options.memTableThreshold=3] - Max keys before flushing
   */
  constructor(options = {}) {
    this.memTableThreshold = options.memTableThreshold || 3;
    this.memTable = new Map();
    this.ssTables = []; // Ordered from oldest to newest
    this.nextSSTableId = 0;
  }

  /**
   * Insert/Update a key-value pair
   * @param {string} key
   * @param {string} value
   */
  put(key, value) {
    if (typeof key !== 'string') {
      throw new Error('InvalidInput: Key must be a string.');
    }
    this.memTable.set(key, value);
    if (this.memTable.size >= this.memTableThreshold) {
      this._flush();
    }
  }

  /**
   * Retrieve value by key
   * @param {string} key
   * @returns {string|null|undefined} Returns string value, null if deleted (tombstone), or undefined if not found
   */
  get(key) {
    // 1. Check MemTable (contains newest updates)
    if (this.memTable.has(key)) {
      const val = this.memTable.get(key);
      return val === null ? null : val;
    }

    // 2. Check SSTables in reverse order (newest first)
    for (let i = this.ssTables.length - 1; i >= 0; i--) {
      const val = this.ssTables[i].get(key);
      if (val !== undefined) {
        return val === null ? null : val;
      }
    }

    return undefined;
  }

  /**
   * Delete a key (writes a tombstone)
   * @param {string} key
   */
  delete(key) {
    this.put(key, null); // null represents the tombstone
  }

  _flush() {
    if (this.memTable.size === 0) return;
    const entries = Array.from(this.memTable.entries());
    const table = new SSTable(this.nextSSTableId++, entries);
    this.ssTables.push(table);
    this.memTable.clear();
  }

  /**
   * Perform compaction: Merge all SSTables, discarding shadowed values & tombstones
   */
  compact() {
    // First, flush the current MemTable to keep things consistent
    this._flush();

    if (this.ssTables.length <= 1) return;

    // Collect all unique keys from newest to oldest to preserve latest updates
    const mergedData = new Map();
    for (let i = this.ssTables.length - 1; i >= 0; i--) {
      const table = this.ssTables[i];
      for (const [k, v] of table.data) {
        if (!mergedData.has(k)) {
          mergedData.set(k, v);
        }
      }
    }

    // Filter out tombstones
    const activeEntries = [];
    for (const [k, v] of mergedData.entries()) {
      if (v !== null) {
        activeEntries.push([k, v]);
      }
    }

    // Replace all SSTables with one compacted SSTable
    this.ssTables = [new SSTable(this.nextSSTableId++, activeEntries)];
  }
}
