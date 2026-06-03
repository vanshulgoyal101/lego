/**
 * observability/log-formatter
 *
 * Structured JSON logger with configurable log levels, correlation IDs,
 * metadata aggregation, and deep key redaction for sensitive fields.
 */

export class LogFormatter {
  constructor(options = {}) {
    this.level = (options.level || 'INFO').toUpperCase();
    this.service = options.service || 'app';
    this.redactPlaceholder = options.redactPlaceholder || '[REDACTED]';
    this.redactKeys = new Set(
      (options.redactKeys || ['password', 'token', 'secret', 'authorization', 'apikey', 'api_key', 'passwd', 'creditcard', 'credit_card'])
        .map(k => k.toLowerCase())
    );

    this.LEVELS = { DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3 };
  }

  /**
   * Set the active log level threshold
   * @param {'DEBUG'|'INFO'|'WARN'|'ERROR'} level
   */
  setLevel(level) {
    this.level = level.toUpperCase();
  }

  /**
   * Deeply traverse an object/value and redact keys matching redactKeys set
   * @param {any} val - Value to redact
   * @param {Set<any>} [seen=new Set()] - Set to prevent infinite loops on circular references
   * @returns {any}
   */
  redact(val, seen = new Set()) {
    if (val === null || val === undefined) return val;

    if (typeof val === 'object') {
      if (seen.has(val)) return '[Circular]';
      seen.add(val);

      if (Array.isArray(val)) {
        const arr = val.map(item => this.redact(item, seen));
        seen.delete(val);
        return arr;
      }

      const res = {};
      for (const k of Object.keys(val)) {
        if (this.redactKeys.has(k.toLowerCase())) {
          res[k] = this.redactPlaceholder;
        } else {
          res[k] = this.redact(val[k], seen);
        }
      }
      seen.delete(val);
      return res;
    }

    return val;
  }

  /**
   * Format a log message to a structured JSON string
   * @param {'DEBUG'|'INFO'|'WARN'|'ERROR'} level
   * @param {string} message
   * @param {Record<string, any>} [meta={}]
   * @param {string} [correlationId=null]
   * @returns {string|null} JSON string representation, or null if below active log level
   */
  format(level, message, meta = {}, correlationId = null) {
    const lvlUpper = level.toUpperCase();
    const threshold = this.LEVELS[this.level] ?? 1;
    const current = this.LEVELS[lvlUpper] ?? 1;

    if (current < threshold) {
      return null;
    }

    const payload = {
      timestamp: new Date().toISOString(),
      level: lvlUpper,
      service: this.service,
      message,
    };

    if (correlationId) {
      payload.correlationId = correlationId;
    }

    if (meta && Object.keys(meta).length > 0) {
      payload.meta = this.redact(meta);
    }

    return JSON.stringify(payload);
  }

  debug(message, meta = {}, correlationId = null) {
    return this.format('DEBUG', message, meta, correlationId);
  }

  info(message, meta = {}, correlationId = null) {
    return this.format('INFO', message, meta, correlationId);
  }

  warn(message, meta = {}, correlationId = null) {
    return this.format('WARN', message, meta, correlationId);
  }

  error(message, meta = {}, correlationId = null) {
    return this.format('ERROR', message, meta, correlationId);
  }
}
