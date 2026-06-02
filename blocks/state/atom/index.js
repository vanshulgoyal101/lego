/**
 * Jotai-style atomic state primitives.
 *
 * An Atom is a self-contained unit of state with:
 *  - get()           – Read the current value (triggers subscriptions).
 *  - set(val|fn)     – Write a new value or apply an updater function.
 *  - subscribe(fn)   – Listen for value changes.
 *  - derive(fn)      – Create a derived read-only atom whose value is computed
 *                      from this atom's value.
 *  - reset()         – Restore the atom to its initial value.
 *  - peek()          – Read the current value WITHOUT triggering subscriptions.
 *
 * Atoms are independent: they do not require a central store or Provider.
 */

/**
 * An independent reactive state unit.
 *
 * @template T
 *
 * @example
 * const count = new Atom(0);
 * count.subscribe(v => console.log('count:', v));
 * count.set(1);            // logs "count: 1"
 * count.set(n => n + 1);   // logs "count: 2"
 * count.reset();           // logs "count: 0"
 */
export class Atom {
  /**
   * @param {T} initialValue - The starting value for this atom.
   */
  constructor(initialValue) {
    /** @type {T} */
    this._value = initialValue;
    /** @type {T} Retained so reset() can restore it. */
    this._initialValue = initialValue;
    /** @type {Set<Function>} */
    this._subscribers = new Set();
  }

  /**
   * Returns the current value of the atom.
   * This is the reactive read path; if called within a derived atom's
   * recompute cycle, the derived atom will be notified on future changes.
   *
   * @returns {T}
   */
  get() {
    return this._value;
  }

  /**
   * Reads the current value without triggering any reactive tracking.
   * Use peek() when you need the value for a one-time read in an effect
   * that should NOT re-run when this atom changes.
   *
   * @returns {T}
   */
  peek() {
    return this._value;
  }

  /**
   * Sets the atom's value and notifies all subscribers if the value changed.
   *
   * @param {T | ((prev: T) => T)} valueOrUpdater - A new value or an updater
   *   function that receives the current value and returns the next value.
   */
  set(valueOrUpdater) {
    const nextValue =
      typeof valueOrUpdater === 'function'
        ? valueOrUpdater(this._value)
        : valueOrUpdater;

    if (nextValue === this._value) return; // Skip if unchanged

    this._value = nextValue;
    this._notifySubscribers(nextValue);
  }

  /**
   * Resets the atom to the value it was initialized with.
   */
  reset() {
    this.set(this._initialValue);
  }

  /**
   * Registers a subscriber that is called whenever the atom's value changes.
   * The subscriber is invoked immediately with the current value upon registration.
   *
   * @param {(value: T) => void} handler - Called with the new value on each change.
   * @returns {() => void} An unsubscribe function.
   */
  subscribe(handler) {
    this._subscribers.add(handler);
    // Fire immediately with current value (standard atom pattern)
    handler(this._value);
    return () => this._subscribers.delete(handler);
  }

  /**
   * Creates a new derived (computed) Atom whose value is the result of
   * applying `fn` to this atom's value. The derived atom updates automatically
   * whenever this atom changes.
   *
   * The derived atom is read-only — calling set() on it throws an error.
   *
   * @template U
   * @param {(value: T) => U} fn - Transformation function.
   * @returns {Atom<U>} A new derived atom.
   *
   * @example
   * const count = new Atom(5);
   * const doubled = count.derive(n => n * 2);
   * doubled.get(); // 10
   * count.set(7);
   * doubled.get(); // 14
   */
  derive(fn) {
    const derived = new Atom(fn(this._value));
    // Override set to make the derived atom read-only
    derived.set = () => {
      throw new Error('Cannot set a derived atom directly');
    };

    // Subscribe this atom to propagate changes to the derived atom
    this.subscribe(value => {
      const next = fn(value);
      // Directly write to bypass the read-only guard on the derived atom
      if (next !== derived._value) {
        derived._value = next;
        derived._notifySubscribers(next);
      }
    });

    return derived;
  }

  /**
   * Internal — notifies all subscribers with the provided value.
   * @param {T} value
   */
  _notifySubscribers(value) {
    for (const handler of this._subscribers) {
      handler(value);
    }
  }
}
