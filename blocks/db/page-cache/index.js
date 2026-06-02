/**
 * Database Page Cache / Buffer Pool Manager
 */
export class PageCache {
  /**
   * @param {number} [capacity=3] - Maximum pages held in memory cache
   * @param {number} [pageSize=4096] - Fixed page size in bytes
   * @param {Object} [storageAdapter] - Storage interface with read(id, size)/write(id, data) methods
   */
  constructor(capacity = 3, pageSize = 4096, storageAdapter = null) {
    this.capacity = capacity;
    this.pageSize = pageSize;
    this.storage = storageAdapter || new Map();
    this.cache = new Map(); // pageId -> { data, isDirty }
    this.lruList = [];
  }

  _updateLRU(pageId) {
    this.lruList = this.lruList.filter(id => id !== pageId);
    this.lruList.push(pageId);
  }

  /**
   * Read page from cache, loading from storage adapter on miss
   *
   * @param {number|string} pageId
   * @returns {Promise<Uint8Array>} Byte buffer of page contents
   */
  async readPage(pageId) {
    if (this.cache.has(pageId)) {
      this._updateLRU(pageId);
      return this.cache.get(pageId).data;
    }

    if (this.cache.size >= this.capacity) {
      await this._evict();
    }

    let data;
    if (typeof this.storage.read === 'function') {
      data = await this.storage.read(pageId, this.pageSize);
    } else {
      data = this.storage.get(pageId) || new Uint8Array(this.pageSize);
    }

    const pageData = new Uint8Array(data);
    this.cache.set(pageId, { data: pageData, isDirty: false });
    this._updateLRU(pageId);

    return pageData;
  }

  /**
   * Write data into page cache in-memory buffer, marking it dirty
   *
   * @param {number|string} pageId
   * @param {Uint8Array} data
   */
  async writePage(pageId, data) {
    if (data.length !== this.pageSize) {
      throw new Error(`InvalidPageSize: Data size must be exactly ${this.pageSize} bytes.`);
    }

    if (this.cache.has(pageId)) {
      const entry = this.cache.get(pageId);
      entry.data.set(data);
      entry.isDirty = true;
      this._updateLRU(pageId);
      return;
    }

    if (this.cache.size >= this.capacity) {
      await this._evict();
    }

    const pageData = new Uint8Array(data);
    this.cache.set(pageId, { data: pageData, isDirty: true });
    this._updateLRU(pageId);
  }

  async _evict() {
    const lruPageId = this.lruList.shift();
    if (lruPageId === undefined) return;

    const entry = this.cache.get(lruPageId);
    if (entry.isDirty) {
      if (typeof this.storage.write === 'function') {
        await this.storage.write(lruPageId, entry.data);
      } else {
        this.storage.set(lruPageId, new Uint8Array(entry.data));
      }
    }
    this.cache.delete(lruPageId);
  }

  /**
   * Flush all dirty pages to the storage adapter
   */
  async flush() {
    for (const [pageId, entry] of this.cache.entries()) {
      if (entry.isDirty) {
        if (typeof this.storage.write === 'function') {
          await this.storage.write(pageId, entry.data);
        } else {
          this.storage.set(pageId, new Uint8Array(entry.data));
        }
        entry.isDirty = false;
      }
    }
  }
}
export default PageCache;
