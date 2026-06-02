/**
 * Browser-like history stack for single-page applications.
 *
 * Mirrors the semantics of the Web History API (window.history) without
 * actually touching the browser's URL or navigation. Useful for building
 * client-side routers, wizard flows, or any stack-based navigation system
 * that needs to run in Node.js or a headless environment.
 *
 * Listeners are called with an action descriptor whenever the history changes.
 */

/**
 * In-memory navigation history stack with push, replace, and directional navigation.
 *
 * @example
 * const history = new HistoryManager();
 * history.push({ page: 'home' }, '/');
 * history.push({ page: 'about' }, '/about');
 * history.back(); // navigates back to '/'
 */
export class HistoryManager {
  /**
   * @param {*}      [initialState=null] - State for the initial history entry.
   * @param {string} [initialUrl='/']    - URL label for the initial history entry.
   */
  constructor(initialState = null, initialUrl = '/') {
    /** @type {Array<{ state: *, url: string }>} */
    this._entries = [{ state: initialState, url: initialUrl }];

    /** @type {number} Current position in the entries array. */
    this._index = 0;

    /** @type {Set<Function>} */
    this._listeners = new Set();
  }

  // ─── Read-only properties ───────────────────────────────────────────────────

  /**
   * A copy of all history entries as `{ state, url }` objects.
   * @type {Array<{ state: *, url: string }>}
   */
  get entries() {
    return this._entries.map(e => ({ state: e.state, url: e.url }));
  }

  /**
   * The current history entry.
   * @type {{ state: *, url: string }}
   */
  get current() {
    return { ...this._entries[this._index] };
  }

  /**
   * The current position index in the entries array.
   * @type {number}
   */
  get index() {
    return this._index;
  }

  // ─── Mutation methods ───────────────────────────────────────────────────────

  /**
   * Pushes a new entry onto the history stack and navigates to it.
   * Any entries forward of the current position are discarded.
   *
   * @param {*}      state      - The state object associated with the entry.
   * @param {string} [url='']   - An optional URL string label.
   */
  push(state, url = '') {
    // Discard any forward history
    this._entries = this._entries.slice(0, this._index + 1);
    this._entries.push({ state, url });
    this._index = this._entries.length - 1;
    this._notify('PUSH', this.current);
  }

  /**
   * Replaces the current history entry without pushing a new one.
   *
   * @param {*}      state    - The new state for the current entry.
   * @param {string} [url=''] - An optional URL string label.
   */
  replace(state, url = '') {
    this._entries[this._index] = { state, url };
    this._notify('REPLACE', this.current);
  }

  /**
   * Navigates back one step in history.
   *
   * @returns {boolean} True if navigation was possible, false if already at start.
   */
  back() {
    return this.go(-1);
  }

  /**
   * Navigates forward one step in history.
   *
   * @returns {boolean} True if navigation was possible, false if already at end.
   */
  forward() {
    return this.go(1);
  }

  /**
   * Navigates by a relative offset in the history stack.
   * Positive values go forward, negative values go back.
   *
   * @param {number} n - The relative offset to navigate by.
   * @returns {boolean} True if the navigation changed the position, false otherwise.
   */
  go(n) {
    const nextIndex = this._index + n;
    if (nextIndex < 0 || nextIndex >= this._entries.length) return false;
    this._index = nextIndex;
    this._notify('POP', this.current);
    return true;
  }

  // ─── Listener management ────────────────────────────────────────────────────

  /**
   * Registers a listener to be called whenever the history changes.
   * The listener is called with `{ action, entry }` where action is one of
   * 'PUSH', 'REPLACE', or 'POP', and entry is `{ state, url }`.
   *
   * @param {Function} handler - Callback: (action: string, entry: { state, url }) => void
   * @returns {Function} An unlisten function that removes the listener.
   */
  listen(handler) {
    this._listeners.add(handler);
    return () => this._listeners.delete(handler);
  }

  /**
   * @param {string} action
   * @param {{ state: *, url: string }} entry
   */
  _notify(action, entry) {
    for (const handler of this._listeners) {
      handler(action, entry);
    }
  }
}
