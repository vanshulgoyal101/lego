/**
 * observability/error-aggregator
 *
 * Fingerprints and groups errors to deduplicate reports. Tracks first/last seen
 * times, counts, variation in messages, and context metadata.
 */

export function defaultFingerprint(error) {
  if (!(error instanceof Error)) {
    return String(error);
  }
  const name = error.name || 'Error';
  const message = error.message || '';

  let stackLoc = '';
  if (error.stack) {
    const lines = error.stack.split('\n');
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      // Skip library/node internals if we want to locate user code
      if (line.includes('node_modules') || line.includes('node:') || line.includes('internal/')) {
        continue;
      }
      stackLoc = line;
      break;
    }
    // Fallback to first line of stack trace if no user line matched
    if (!stackLoc && lines[1]) {
      stackLoc = lines[1].trim();
    }
  }

  return `${name}:${message}:${stackLoc}`;
}

export class ErrorAggregator {
  constructor(options = {}) {
    this.fingerprintFn = options.fingerprintFn || defaultFingerprint;
    this.maxUniqueErrors = options.maxUniqueErrors || 1000;
    this.errors = new Map(); // fingerprint -> AggregatedError
  }

  /**
   * Report an error occurrence.
   * @param {Error|string|any} error - The error object or message.
   * @param {Record<string, any>} [context={}] - Contextual details (e.g. userId, url)
   * @returns {object} The updated aggregated error record.
   */
  report(error, context = {}) {
    const fingerprint = this.fingerprintFn(error);
    const time = new Date().toISOString();

    let agg = this.errors.get(fingerprint);
    if (!agg) {
      if (this.errors.size >= this.maxUniqueErrors) {
        // Evict oldest/least active if limit reached (simple cleanup)
        const oldestKey = this.errors.keys().next().value;
        this.errors.delete(oldestKey);
      }

      agg = {
        fingerprint,
        name: error instanceof Error ? error.name : 'Error',
        sampleMessage: error instanceof Error ? error.message : String(error),
        messages: new Set([error instanceof Error ? error.message : String(error)]),
        stack: error instanceof Error ? error.stack : '',
        count: 0,
        firstSeen: time,
        lastSeen: time,
        contexts: []
      };
      this.errors.set(fingerprint, agg);
    }

    agg.count++;
    agg.lastSeen = time;
    if (error instanceof Error) {
      agg.messages.add(error.message);
    } else {
      agg.messages.add(String(error));
    }

    // Keep last 10 contexts to avoid memory bloat
    agg.contexts.push({ time, ...context });
    if (agg.contexts.length > 10) {
      agg.contexts.shift();
    }

    return {
      ...agg,
      messages: Array.from(agg.messages)
    };
  }

  /**
   * Get all aggregated error groups
   * @returns {object[]}
   */
  getErrors() {
    return Array.from(this.errors.values()).map(agg => ({
      ...agg,
      messages: Array.from(agg.messages)
    }));
  }

  /**
   * Get a specific error group by its fingerprint
   * @param {string} fingerprint
   * @returns {object|null}
   */
  getError(fingerprint) {
    const agg = this.errors.get(fingerprint);
    if (!agg) return null;
    return {
      ...agg,
      messages: Array.from(agg.messages)
    };
  }

  /**
   * Clear all collected error aggregates
   */
  clear() {
    this.errors.clear();
  }
}
