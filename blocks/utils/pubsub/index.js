/**
 * PubSub - Publish-Subscribe Message Bus
 * Wildcard topic matching, one-time subscriptions, async delivery, history replay.
 */

/**
 * Check if a topic matches a pattern.
 * Patterns support: * (single segment), ** (any depth), exact string.
 * Example: 'user.*' matches 'user.created', 'user.deleted'.
 *          'user.**' matches 'user.created', 'user.profile.updated'.
 */
function topicMatches(pattern, topic) {
  const patParts = pattern.split('.');
  const topicParts = topic.split('.');

  let pi = 0;
  let ti = 0;

  while (pi < patParts.length && ti < topicParts.length) {
    if (patParts[pi] === '**') {
      // ** matches any number of segments
      return true;
    }
    if (patParts[pi] === '*') {
      // * matches exactly one segment
      pi++; ti++;
      continue;
    }
    if (patParts[pi] === topicParts[ti]) {
      pi++; ti++;
    } else {
      return false;
    }
  }

  return pi === patParts.length && ti === topicParts.length;
}

export class PubSub {
  constructor(options = {}) {
    this._subscribers = new Map(); // pattern -> [{ id, handler, once }]
    this._history = new Map(); // topic -> [message, ...]
    this._maxHistory = options.maxHistory || 0; // 0 = disabled
    this._asyncDelivery = options.asyncDelivery || false;
    this._nextId = 1;
  }

  /**
   * Subscribe to a topic pattern.
   * @param {string} pattern - Topic pattern (e.g. 'user.*', 'orders.#.created').
   * @param {Function} handler - Called with (message, topic) when matching message published.
   * @param {Object} [options]
   * @param {boolean} [options.once=false] - If true, auto-unsubscribes after first delivery.
   * @param {boolean} [options.replay=false] - If true, replays history for matching topics.
   * @returns {Function} Unsubscribe function.
   */
  subscribe(pattern, handler, options = {}) {
    const id = this._nextId++;
    const entry = { id, handler, once: options.once || false, pattern };

    if (!this._subscribers.has(pattern)) {
      this._subscribers.set(pattern, []);
    }
    this._subscribers.get(pattern).push(entry);

    // Replay history for matching topics
    if (options.replay && this._maxHistory > 0) {
      for (const [topic, messages] of this._history.entries()) {
        if (topicMatches(pattern, topic)) {
          for (const msg of messages) {
            this._deliver(entry, msg, topic);
          }
        }
      }
    }

    return () => this.unsubscribe(id);
  }

  /**
   * Subscribe to a topic once, auto-unsubscribing after first delivery.
   * @param {string} pattern
   * @param {Function} handler
   * @returns {Function} Unsubscribe function.
   */
  once(pattern, handler) {
    return this.subscribe(pattern, handler, { once: true });
  }

  /**
   * Unsubscribe a specific subscriber by ID.
   * @param {number} id - Subscription ID.
   */
  unsubscribe(id) {
    for (const [pattern, subs] of this._subscribers.entries()) {
      const idx = subs.findIndex(s => s.id === id);
      if (idx !== -1) {
        subs.splice(idx, 1);
        if (subs.length === 0) this._subscribers.delete(pattern);
        return true;
      }
    }
    return false;
  }

  /**
   * Publish a message to a topic.
   * @param {string} topic - The specific topic (e.g. 'user.created').
   * @param {any} message - The message payload.
   */
  publish(topic, message) {
    // Record history
    if (this._maxHistory > 0) {
      if (!this._history.has(topic)) this._history.set(topic, []);
      const hist = this._history.get(topic);
      hist.push(message);
      if (hist.length > this._maxHistory) hist.shift();
    }

    const toRemove = [];

    for (const [pattern, subs] of this._subscribers.entries()) {
      if (topicMatches(pattern, topic)) {
        for (const entry of subs) {
          this._deliver(entry, message, topic);
          if (entry.once) toRemove.push(entry.id);
        }
      }
    }

    for (const id of toRemove) this.unsubscribe(id);
  }

  _deliver(entry, message, topic) {
    if (this._asyncDelivery) {
      Promise.resolve().then(() => entry.handler(message, topic));
    } else {
      entry.handler(message, topic);
    }
  }

  /**
   * Get the message history for a specific topic.
   * @param {string} topic
   * @returns {Array}
   */
  getHistory(topic) {
    return [...(this._history.get(topic) || [])];
  }

  /**
   * Clear all subscriptions and history.
   */
  clear() {
    this._subscribers.clear();
    this._history.clear();
  }

  /**
   * Get the number of active subscriptions.
   * @returns {number}
   */
  get subscriberCount() {
    let count = 0;
    for (const subs of this._subscribers.values()) count += subs.length;
    return count;
  }
}
