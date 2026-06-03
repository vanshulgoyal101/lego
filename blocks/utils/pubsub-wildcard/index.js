export class PubSubWildcard {
  constructor() {
    this.subscribers = []; // Array of { pattern, regex, callback }
  }

  /**
   * Converts a wildcard pattern into a RegExp.
   * - '*' matches a single segment (excluding '.')
   * - '**' matches zero or more segments
   * @param {string} pattern
   * @returns {RegExp}
   */
  _patternToRegex(pattern) {
    // Escape standard regex characters except * and ?
    let escaped = pattern.replace(/[.+^${}()|[\]\\*]/g, '\\$&');

    // Convert '**' to a pattern matching zero or more characters (including dot)
    escaped = escaped.replace(/\\\*\\\*/g, '.*');

    // Convert '*' to a pattern matching one or more characters excluding dot
    escaped = escaped.replace(/\\\*/g, '[^.]+');

    return new RegExp(`^${escaped}$`);
  }

  /**
   * Subscribe to a pattern.
   * @param {string} pattern - E.g. 'users.*' or 'orders.**.created'
   * @param {Function} callback
   * @returns {Function} Unsubscribe function
   */
  subscribe(pattern, callback) {
    const regex = this._patternToRegex(pattern);
    const sub = { pattern, regex, callback };
    this.subscribers.push(sub);

    return () => this.unsubscribe(pattern, callback);
  }

  /**
   * Unsubscribe from a pattern.
   */
  unsubscribe(pattern, callback) {
    this.subscribers = this.subscribers.filter(
      sub => !(sub.pattern === pattern && sub.callback === callback)
    );
  }

  /**
   * Publish data to a topic.
   * @param {string} topic - E.g. 'users.login' or 'orders.us.created'
   * @param {*} data
   * @returns {number} The number of matched subscribers notified
   */
  publish(topic, data) {
    let count = 0;
    for (const sub of this.subscribers) {
      if (sub.regex.test(topic)) {
        sub.callback(topic, data);
        count++;
      }
    }
    return count;
  }
}
