/**
 * In-memory Key-Value database store with TTL support, event listeners,
 * and persistence adapter hook hooks.
 */
export class KeyValueStore {
  constructor(options = {}) {
    this.store = new Map();
    this.listeners = new Map();
    this.ttlCheckInterval = options.ttlCheckInterval || 5000;
    this.persistAdapter = options.persistAdapter || null; // e.g. { save(data), load() }

    this.timer = null;
    this._startTtlScanner();
  }

  set(key, value, ttlMs = null) {
    const expiresAt = ttlMs ? Date.now() + ttlMs : null;
    const oldEntry = this.store.get(key);
    this.store.set(key, { value, expiresAt });

    this._trigger('set', { key, value, expiresAt });
    if (!oldEntry) {
      this._trigger('create', { key, value, expiresAt });
    } else {
      this._trigger('update', { key, value, expiresAt, oldValue: oldEntry.value });
    }

    this._saveState();
  }

  get(key) {
    const entry = this.store.get(key);
    if (!entry) {
      this._trigger('miss', { key });
      return undefined;
    }

    if (entry.expiresAt && entry.expiresAt < Date.now()) {
      this.delete(key, 'expired');
      this._trigger('miss', { key });
      return undefined;
    }

    this._trigger('get', { key, value: entry.value });
    return entry.value;
  }

  has(key) {
    const entry = this.store.get(key);
    if (!entry) return false;
    if (entry.expiresAt && entry.expiresAt < Date.now()) {
      this.delete(key, 'expired');
      return false;
    }
    return true;
  }

  delete(key, reason = 'deleted') {
    const entry = this.store.get(key);
    if (!entry) return false;

    this.store.delete(key);
    this._trigger('delete', { key, value: entry.value, reason });
    this._saveState();
    return true;
  }

  clear() {
    this.store.clear();
    this._trigger('clear', {});
    this._saveState();
  }

  size() {
    this._pruneExpired();
    return this.store.size;
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  off(event, callback) {
    const list = this.listeners.get(event);
    if (!list) return;
    const index = list.indexOf(callback);
    if (index !== -1) {
      list.splice(index, 1);
    }
  }

  _trigger(event, data) {
    const list = this.listeners.get(event);
    if (list) {
      for (const cb of list) {
        try {
          cb(data);
        } catch (err) {
          console.error(`Error in KeyValueStore "${event}" listener:`, err);
        }
      }
    }
  }

  _startTtlScanner() {
    if (this.ttlCheckInterval > 0) {
      this.timer = setInterval(() => {
        this._pruneExpired();
      }, this.ttlCheckInterval);
      if (this.timer && this.timer.unref) {
        this.timer.unref(); // Don't block Node.js from exiting
      }
    }
  }

  _pruneExpired() {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (entry.expiresAt && entry.expiresAt < now) {
        this.delete(key, 'expired');
      }
    }
  }

  async _saveState() {
    if (this.persistAdapter && typeof this.persistAdapter.save === 'function') {
      const data = {};
      for (const [key, entry] of this.store.entries()) {
        data[key] = entry;
      }
      try {
        await this.persistAdapter.save(data);
      } catch (err) {
        console.error('Failed to save KeyValueStore state via adapter:', err);
      }
    }
  }

  async load() {
    if (this.persistAdapter && typeof this.persistAdapter.load === 'function') {
      try {
        const data = await this.persistAdapter.load();
        if (data) {
          this.store.clear();
          for (const key of Object.keys(data)) {
            const entry = data[key];
            this.store.set(key, entry);
          }
          this._trigger('load', { count: this.store.size });
        }
      } catch (err) {
        console.error('Failed to load KeyValueStore state via adapter:', err);
      }
    }
  }

  destroy() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }
}
