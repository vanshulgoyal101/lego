/**
 * Event Bus
 * A typed singleton global event bus for decoupled publish-subscribe messaging.
 * Supports standard subscription, one-time subscription, unsubscription,
 * and full or per-event clearing.
 */

/** @typedef {function(...any): void} Handler */

/**
 * Internal registry mapping event names to sets of handlers.
 * Stored outside the class so the singleton shares a single source of truth.
 *
 * @type {Map<string, Set<Handler>>}
 */
const _registry = new Map();

/**
 * Internal registry for one-time (once) handlers.
 * Maps original handler → wrapper so `off` can remove the wrapper.
 *
 * @type {Map<string, Map<Handler, Handler>>}
 */
const _onceMap = new Map();

/**
 * EventBus – a global event bus singleton.
 *
 * All methods are static so the class itself IS the singleton.
 * Import and use directly: `EventBus.on(...)`, `EventBus.emit(...)`.
 */
export class EventBus {
  constructor() {
    throw new Error('EventBus is a static singleton; do not instantiate it.');
  }

  /**
   * Subscribes `handler` to `event`. The handler is called every time
   * the event is emitted until explicitly removed with `off`.
   *
   * @param {string} event - Event name.
   * @param {Handler} handler - Callback to invoke on emit.
   * @returns {function(): void} An unsubscribe function for convenience.
   * @example
   * const unsub = EventBus.on('login', user => console.log(user));
   * // Later:
   * unsub();
   */
  static on(event, handler) {
    if (typeof event !== 'string' || !event) throw new TypeError('event must be a non-empty string');
    if (typeof handler !== 'function') throw new TypeError('handler must be a function');

    if (!_registry.has(event)) _registry.set(event, new Set());
    _registry.get(event).add(handler);

    return () => EventBus.off(event, handler);
  }

  /**
   * Subscribes `handler` to `event` for exactly one invocation.
   * After the first emit, the handler is automatically removed.
   *
   * @param {string} event - Event name.
   * @param {Handler} handler - Callback invoked once.
   * @returns {function(): void} An unsubscribe function.
   */
  static once(event, handler) {
    if (typeof handler !== 'function') throw new TypeError('handler must be a function');

    const wrapper = (...args) => {
      handler(...args);
      EventBus.off(event, handler);
    };

    // Store wrapper so `off(event, originalHandler)` can find and remove it
    if (!_onceMap.has(event)) _onceMap.set(event, new Map());
    _onceMap.get(event).set(handler, wrapper);

    return EventBus.on(event, wrapper);
  }

  /**
   * Unsubscribes `handler` from `event`.
   * If the handler was registered with `once`, the internal wrapper is removed.
   *
   * @param {string} event - Event name.
   * @param {Handler} handler - The original handler reference.
   */
  static off(event, handler) {
    if (typeof handler !== 'function') throw new TypeError('handler must be a function');

    // Check if it was a once-wrapped handler
    const onceHandlers = _onceMap.get(event);
    if (onceHandlers && onceHandlers.has(handler)) {
      const wrapper = onceHandlers.get(handler);
      onceHandlers.delete(handler);
      _registry.get(event)?.delete(wrapper);
      return;
    }

    _registry.get(event)?.delete(handler);
  }

  /**
   * Emits `event`, invoking all registered handlers with the provided data.
   * Handlers are called synchronously in subscription order.
   *
   * @param {string} event - Event name.
   * @param {...any} args - Arguments forwarded to every handler.
   */
  static emit(event, ...args) {
    if (typeof event !== 'string' || !event) throw new TypeError('event must be a non-empty string');

    const handlers = _registry.get(event);
    if (!handlers || handlers.size === 0) return;

    // Snapshot handlers before iteration to handle `once` removal mid-iteration
    for (const handler of [...handlers]) {
      handler(...args);
    }
  }

  /**
   * Clears handlers for a specific event, or all events if no argument given.
   *
   * @param {string} [event] - Event name. Omit to clear every event.
   */
  static clear(event) {
    if (event === undefined) {
      _registry.clear();
      _onceMap.clear();
    } else {
      _registry.delete(event);
      _onceMap.delete(event);
    }
  }

  /**
   * Returns the number of handlers currently registered for `event`.
   *
   * @param {string} event - Event name.
   * @returns {number} Handler count.
   */
  static listenerCount(event) {
    return _registry.get(event)?.size ?? 0;
  }

  /**
   * Returns an array of all event names that currently have at least one listener.
   *
   * @returns {string[]} Active event names.
   */
  static eventNames() {
    return [..._registry.entries()]
      .filter(([, handlers]) => handlers.size > 0)
      .map(([name]) => name);
  }
}
