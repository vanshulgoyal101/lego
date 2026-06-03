/**
 * observability/span-tracer
 *
 * Lightweight distributed tracing block. Supports nested spans, parents, attributes,
 * events, status tracking, and parsing/formatting of W3C traceparent headers.
 */

// Helper to generate random hex strings
function randomHex(bytesLen) {
  const bytes = new Uint8Array(bytesLen);
  if (typeof globalThis !== 'undefined' && (globalThis.crypto || globalThis.webcrypto)) {
    (globalThis.crypto || globalThis.webcrypto).getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytesLen; i++) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }
  return Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
}

export class Span {
  constructor(name, context = {}) {
    this.name = name;
    this.traceId = context.traceId || randomHex(16);
    this.spanId = context.spanId || randomHex(8);
    this.parentId = context.parentId || null;
    this.traceFlags = context.traceFlags || '01'; // sampled by default
    this.startTime = context.startTime || Date.now();
    this.endTime = null;
    this.attributes = { ...(context.attributes || {}) };
    this.events = [];
    this.status = { code: 'UNSET', message: '' };
  }

  /**
   * Set span attribute
   * @param {string} key
   * @param {any} value
   * @returns {Span}
   */
  setAttribute(key, value) {
    this.attributes[key] = value;
    return this;
  }

  /**
   * Set multiple span attributes
   * @param {Record<string, any>} attrs
   * @returns {Span}
   */
  setAttributes(attrs) {
    Object.assign(this.attributes, attrs);
    return this;
  }

  /**
   * Add a timed event annotation
   * @param {string} name
   * @param {Record<string, any>} [attributes={}]
   * @returns {Span}
   */
  addEvent(name, attributes = {}) {
    this.events.push({
      name,
      time: Date.now(),
      attributes
    });
    return this;
  }

  /**
   * Set the status of the span (e.g. OK, ERROR)
   * @param {'OK'|'ERROR'|'UNSET'} code
   * @param {string} [message='']
   * @returns {Span}
   */
  setStatus(code, message = '') {
    this.status = { code, message };
    return this;
  }

  /**
   * End the span
   * @param {number} [endTime]
   */
  end(endTime) {
    this.endTime = endTime || Date.now();
  }

  /**
   * Check if span is ended
   * @returns {boolean}
   */
  isEnded() {
    return this.endTime !== null;
  }

  /**
   * Calculate duration in milliseconds
   * @returns {number}
   */
  getDuration() {
    if (!this.endTime) {
      return Date.now() - this.startTime;
    }
    return this.endTime - this.startTime;
  }

  /**
   * Convert span context to W3C traceparent header string
   * Format: 00-traceId-spanId-traceFlags
   * @returns {string}
   */
  toTraceParent() {
    return `00-${this.traceId}-${this.spanId}-${this.traceFlags}`;
  }

  /**
   * Parse a W3C traceparent header string and return context options
   * @param {string} header
   * @returns {{ traceId: string, parentId: string, traceFlags: string } | null}
   */
  static fromTraceParent(header) {
    if (typeof header !== 'string') return null;
    const parts = header.trim().split('-');
    if (parts.length !== 4) return null;
    if (parts[0] !== '00') return null; // Only version 00 is supported by W3C Trace Context spec v1
    const [_, traceId, parentId, traceFlags] = parts;
    if (traceId.length !== 32 || parentId.length !== 16 || traceFlags.length !== 2) {
      return null;
    }
    return {
      traceId,
      parentId,
      traceFlags
    };
  }
}

export class SpanTracer {
  constructor() {
    this.spans = [];
  }

  /**
   * Start a new span
   * @param {string} name
   * @param {object} [options={}]
   * @param {string|Span} [options.parent] - Parent span or traceparent header
   * @param {Record<string, any>} [options.attributes={}]
   * @returns {Span}
   */
  startSpan(name, options = {}) {
    const context = {
      attributes: options.attributes || {}
    };

    if (options.parent) {
      if (options.parent instanceof Span) {
        context.traceId = options.parent.traceId;
        context.parentId = options.parent.spanId;
        context.traceFlags = options.parent.traceFlags;
      } else if (typeof options.parent === 'string') {
        const parsed = Span.fromTraceParent(options.parent);
        if (parsed) {
          context.traceId = parsed.traceId;
          context.parentId = parsed.parentId;
          context.traceFlags = parsed.traceFlags;
        }
      }
    }

    const span = new Span(name, context);
    this.spans.push(span);
    return span;
  }

  /**
   * Get all active or ended spans tracked by this tracer
   * @returns {Span[]}
   */
  getSpans() {
    return this.spans;
  }

  /**
   * Clear the list of tracked spans
   */
  clear() {
    this.spans = [];
  }
}
