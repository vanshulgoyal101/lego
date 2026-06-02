/**
 * A standard, dependency-free EventEmitter implementation.
 * Supports registering listeners, once-listeners, emitting events, and removal.
 */
export class EventEmitter {
  constructor() {
    this.events = new Map();
  }

  /**
   * Register a listener for an event.
   * @param {string} event - Event name.
   * @param {Function} listener - Callback function.
   * @returns {EventEmitter} Chainable this.
   */
  on(event, listener) {
    if (typeof listener !== 'function') {
      throw new TypeError('Listener must be a function');
    }
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    this.events.get(event).push({ listener, once: false });
    return this;
  }

  /**
   * Register a one-time listener for an event.
   * @param {string} event - Event name.
   * @param {Function} listener - Callback function.
   * @returns {EventEmitter} Chainable this.
   */
  once(event, listener) {
    if (typeof listener !== 'function') {
      throw new TypeError('Listener must be a function');
    }
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    this.events.get(event).push({ listener, once: true });
    return this;
  }

  /**
   * Remove a listener from an event.
   * @param {string} event - Event name.
   * @param {Function} listener - Callback to remove.
   * @returns {EventEmitter} Chainable this.
   */
  off(event, listener) {
    if (!this.events.has(event)) {
      return this;
    }
    const list = this.events.get(event);
    const index = list.findIndex(item => item.listener === listener);
    if (index !== -1) {
      list.splice(index, 1);
    }
    if (list.length === 0) {
      this.events.delete(event);
    }
    return this;
  }

  /**
   * Emit an event, calling all registered listeners.
   * @param {string} event - Event name.
   * @param {...*} args - Parameters passed to the listeners.
   * @returns {boolean} True if event had listeners, false otherwise.
   */
  emit(event, ...args) {
    if (!this.events.has(event)) {
      return false;
    }

    // Clone list to prevent issues if listeners modify the listeners array during emit
    const listeners = [...this.events.get(event)];
    
    listeners.forEach(({ listener, once }) => {
      try {
        listener(...args);
      } catch (err) {
        console.error(`Error in event listener for '${event}':`, err);
      }
      
      if (once) {
        this.off(event, listener);
      }
    });

    return true;
  }

  /**
   * Return number of active listeners for an event.
   * @param {string} event - Event name.
   * @returns {number}
   */
  listenerCount(event) {
    if (!this.events.has(event)) {
      return 0;
    }
    return this.events.get(event).length;
  }

  /**
   * Remove all listeners, optionally for a specific event.
   * @param {string} [event] - Event name.
   * @returns {EventEmitter} Chainable this.
   */
  removeAllListeners(event) {
    if (event) {
      this.events.delete(event);
    } else {
      this.events.clear();
    }
    return this;
  }
}
