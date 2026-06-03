/**
 * @module agent/memory-buffer
 * @description Sliding context window memory manager for AI agents.
 * Tracks conversation history, estimates token usage, and supports
 * summarization when the context window approaches its limit.
 */

/**
 * Estimates the number of tokens in a text string using a simple
 * character-based heuristic (~4 characters per token on average).
 *
 * @param {string} text - The text to tokenize.
 * @returns {number} Estimated token count.
 */
export function defaultTokenizer(text) {
  if (!text || typeof text !== 'string') return 0;
  return Math.ceil(text.length / 4);
}

/**
 * A sliding context window memory manager for AI agent conversations.
 *
 * Maintains a list of messages with token counts, enforces a maximum
 * token budget, and supports summarization to compress history when
 * the context window becomes too full.
 *
 * @example
 * const memory = new MemoryBuffer({ maxTokens: 2000 });
 * memory.add('user', 'Hello, how are you?');
 * memory.add('assistant', 'I am doing well, thank you!');
 * console.log(memory.getMessages());
 * console.log(memory.getTotalTokens());
 *
 * if (memory.needsSummarization()) {
 *   memory.summarize('Earlier the user greeted the assistant.');
 * }
 */
export class MemoryBuffer {
  /**
   * @param {object} [options]
   * @param {number} [options.maxTokens=4000] - Maximum token budget for the context window.
   * @param {function(string): number} [options.tokenizer=defaultTokenizer] - Function to estimate token count from text.
   */
  constructor({ maxTokens = 4000, tokenizer = defaultTokenizer } = {}) {
    if (typeof maxTokens !== 'number' || maxTokens <= 0) {
      throw new RangeError('maxTokens must be a positive number');
    }
    if (typeof tokenizer !== 'function') {
      throw new TypeError('tokenizer must be a function');
    }

    /** @type {number} */
    this.maxTokens = maxTokens;

    /** @type {function(string): number} */
    this.tokenizer = tokenizer;

    /**
     * Internal message store. Each entry: { role, content, tokens, timestamp }
     * @type {Array<{role: string, content: string, tokens: number, timestamp: string}>}
     */
    this._messages = [];
  }

  /**
   * Adds a new message to the memory buffer.
   * If adding the message would exceed maxTokens, the oldest messages are
   * evicted (sliding window) until the message fits.
   *
   * @param {string} role - The role of the message sender (e.g. 'user', 'assistant', 'system').
   * @param {string} content - The message content.
   * @returns {{ role: string, content: string, tokens: number, timestamp: string }} The added message object.
   */
  add(role, content) {
    if (!role || typeof role !== 'string') {
      throw new TypeError('role must be a non-empty string');
    }
    if (typeof content !== 'string') {
      throw new TypeError('content must be a string');
    }

    const tokens = this.tokenizer(content);
    const message = {
      role,
      content,
      tokens,
      timestamp: new Date().toISOString(),
    };

    // Evict oldest messages until the new message fits within maxTokens
    while (
      this._messages.length > 0 &&
      this._getTotalTokensRaw() + tokens > this.maxTokens
    ) {
      this._messages.shift();
    }

    this._messages.push(message);
    return message;
  }

  /**
   * Returns the current list of messages that fit within the token budget.
   * Messages are returned in chronological order (oldest first).
   *
   * @returns {Array<{role: string, content: string, tokens: number, timestamp: string}>}
   */
  getMessages() {
    return [...this._messages];
  }

  /**
   * Returns the total token count of all messages currently in the buffer.
   *
   * @returns {number}
   */
  getTotalTokens() {
    return this._getTotalTokensRaw();
  }

  /**
   * Clears all messages from the buffer.
   */
  clear() {
    this._messages = [];
  }

  /**
   * Replaces all current messages with a single system-role summary message.
   * Useful for compressing long conversation history into a concise context.
   *
   * @param {string} summaryContent - The summary text to store as the new context.
   */
  summarize(summaryContent) {
    if (typeof summaryContent !== 'string') {
      throw new TypeError('summaryContent must be a string');
    }
    this._messages = [];
    this.add('system', summaryContent);
  }

  /**
   * Returns true if the current token usage exceeds the given threshold
   * fraction of maxTokens, indicating that summarization should be considered.
   *
   * @param {number} [threshold=0.9] - Fraction of maxTokens (0–1) at which to trigger summarization.
   * @returns {boolean}
   */
  needsSummarization(threshold = 0.9) {
    if (typeof threshold !== 'number' || threshold <= 0 || threshold > 1) {
      throw new RangeError('threshold must be a number between 0 (exclusive) and 1 (inclusive)');
    }
    return this._getTotalTokensRaw() > this.maxTokens * threshold;
  }

  /**
   * Serializes the MemoryBuffer to a plain JSON-compatible object.
   *
   * @returns {{ maxTokens: number, messages: Array }}
   */
  toJSON() {
    return {
      maxTokens: this.maxTokens,
      messages: this._messages.map((m) => ({ ...m })),
    };
  }

  /**
   * Restores a MemoryBuffer instance from a previously serialized JSON object.
   * Note: The tokenizer function cannot be serialized; `defaultTokenizer` is used
   * unless you pass a custom one via `options`.
   *
   * @param {{ maxTokens: number, messages: Array }} json - Serialized buffer data.
   * @param {object} [options] - Optional overrides (e.g. a custom tokenizer).
   * @param {function(string): number} [options.tokenizer=defaultTokenizer]
   * @returns {MemoryBuffer}
   */
  static fromJSON(json, { tokenizer = defaultTokenizer } = {}) {
    if (!json || typeof json !== 'object') {
      throw new TypeError('json must be a non-null object');
    }
    const buffer = new MemoryBuffer({ maxTokens: json.maxTokens, tokenizer });
    // Restore messages directly, preserving original timestamps and token counts
    buffer._messages = (json.messages || []).map((m) => ({ ...m }));
    return buffer;
  }

  // ─── Private helpers ────────────────────────────────────────────────────────

  /**
   * @private
   * @returns {number}
   */
  _getTotalTokensRaw() {
    return this._messages.reduce((sum, m) => sum + m.tokens, 0);
  }
}
