/**
 * Observable key-value state store — a lightweight MobX-style reactive store.
 *
 * Observers can subscribe to individual keys and are notified synchronously
 * whenever the value changes. Batched mutations via transaction() suppress
 * intermediate notifications and fire one notification per changed key at
 * the end of the transaction.
 */

/**
 * A reactive key-value store where individual keys can be observed.
 *
 * @example
 * const store = new ObservableStore({ count: 0 });
 * store.observe('count', (newVal, oldVal) => console.log(newVal));
 * store.set('count', 1); // logs 1
 */
export class ObservableStore {
  /**
   * @param {Object} [initialState={}] - Seed values for the store.
   */
  constructor(initialState = {}) {
    /** @type {Map<string, *>} Internal state map. */
    this._state = new Map(Object.entries(initialState));

    /** @type {Map<string, Set<Function>>} Per-key observer sets. */
    this._observers = new Map();

    /** @type {boolean} Whether a transaction is in progress. */
    this._inTransaction = false;

    /** @type {Map<string, *>} Tracks old values for keys changed during a transaction. */
    this._pendingChanges = new Map();
  }

  /**
   * Retrieves the current value for a key.
   *
   * @param {string} key
   * @returns {*} The stored value, or undefined if the key does not exist.
   */
  get(key) {
    return this._state.get(key);
  }

  /**
   * Sets the value for a key and notifies observers if the value changed.
   * Inside a transaction, notifications are deferred until the transaction ends.
   *
   * @param {string} key
   * @param {*}      value - The new value.
   */
  set(key, value) {
    const oldValue = this._state.get(key);
    if (oldValue === value) return; // No change — skip

    if (this._inTransaction) {
      // Track original (pre-transaction) old value for notification
      if (!this._pendingChanges.has(key)) {
        this._pendingChanges.set(key, oldValue);
      }
      this._state.set(key, value);
    } else {
      this._state.set(key, value);
      this._notify(key, value, oldValue);
    }
  }

  /**
   * Subscribes a handler to changes on a specific key.
   * The handler is called with (newValue, oldValue, key) on each change.
   *
   * @param {string}   key
   * @param {Function} handler - Called as handler(newValue, oldValue, key).
   * @returns {Function} An unobserve function that removes the handler.
   */
  observe(key, handler) {
    if (!this._observers.has(key)) {
      this._observers.set(key, new Set());
    }
    this._observers.get(key).add(handler);
    return () => this.unobserve(key, handler);
  }

  /**
   * Removes a previously registered handler for a key.
   *
   * @param {string}   key
   * @param {Function} handler - The handler to remove.
   */
  unobserve(key, handler) {
    const handlers = this._observers.get(key);
    if (handlers) {
      handlers.delete(handler);
      if (handlers.size === 0) this._observers.delete(key);
    }
  }

  /**
   * Executes a batch of mutations inside a transaction.
   * All set() calls within fn() are buffered; observers are notified once
   * per changed key after the transaction completes.
   *
   * @param {Function} fn - Synchronous mutation function.
   * @throws Re-throws any error from fn after restoring state.
   */
  transaction(fn) {
    this._inTransaction = true;
    this._pendingChanges = new Map();

    try {
      fn();
    } catch (err) {
      // Roll back all changes made during the failed transaction
      for (const [key, oldValue] of this._pendingChanges) {
        if (oldValue === undefined) {
          this._state.delete(key);
        } else {
          this._state.set(key, oldValue);
        }
      }
      this._inTransaction = false;
      this._pendingChanges = new Map();
      throw err;
    }

    // Commit: notify observers for each changed key
    this._inTransaction = false;
    for (const [key, oldValue] of this._pendingChanges) {
      const newValue = this._state.get(key);
      if (newValue !== oldValue) {
        this._notify(key, newValue, oldValue);
      }
    }
    this._pendingChanges = new Map();
  }

  /**
   * Serializes the current store state to a plain JSON object.
   *
   * @returns {Object}
   */
  toJSON() {
    return Object.fromEntries(this._state);
  }

  /**
   * Notifies all observers registered for a key.
   *
   * @param {string} key
   * @param {*}      newValue
   * @param {*}      oldValue
   */
  _notify(key, newValue, oldValue) {
    const handlers = this._observers.get(key);
    if (handlers) {
      for (const handler of handlers) {
        handler(newValue, oldValue, key);
      }
    }
  }
}
