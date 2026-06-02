/**
 * In-memory Time-Series Database.
 * Optimized for append-only logs, rolling window aggregations, metric retention policies,
 * metrics downsampling, and automated threshold alert triggers.
 */

export class TimeSeriesDb {
  constructor(options = {}) {
    this.series = new Map(); // metricName -> Array({ timestamp, value, tags })
    this.retentionPolicies = new Map(); // metricName -> ttlMs
    this.alertRules = new Map(); // metricName -> Array({ threshold, operator, callback })

    this.pruneInterval = options.pruneInterval || 10000;
    this.timer = null;
    this._startPruneScheduler();
  }

  insert(metric, value, tags = {}, timestamp = Date.now()) {
    if (!this.series.has(metric)) {
      this.series.set(metric, []);
    }

    const dataPoint = {
      timestamp: Number(timestamp),
      value: Number(value),
      tags: { ...tags }
    };

    const points = this.series.get(metric);
    
    // Maintain sorted order by binary inserting or pushing + sorting
    points.push(dataPoint);
    points.sort((a, b) => a.timestamp - b.timestamp);

    // Trigger alert checks
    this._evaluateAlerts(metric, dataPoint);
  }

  setRetention(metric, ttlMs) {
    this.retentionPolicies.set(metric, Number(ttlMs));
  }

  addAlertRule(metric, threshold, operator, callback) {
    if (!this.alertRules.has(metric)) {
      this.alertRules.set(metric, []);
    }
    this.alertRules.get(metric).push({ threshold, operator, callback });
  }

  query(metric, options = {}) {
    const points = this.series.get(metric) || [];
    const start = options.start !== undefined ? options.start : -Infinity;
    const end = options.end !== undefined ? options.end : Infinity;

    return points.filter(p => {
      if (p.timestamp < start || p.timestamp > end) return false;
      if (options.tags) {
        for (const [k, v] of Object.entries(options.tags)) {
          if (p.tags[k] !== v) return false;
        }
      }
      return true;
    });
  }

  /**
   * Aggregates metrics into time window buckets (e.g. 1-minute averages).
   */
  aggregate(metric, windowSizeMs, operator = 'mean', options = {}) {
    const points = this.query(metric, options);
    if (points.length === 0) return [];

    const buckets = new Map(); // bucketStartTimestamp -> Array(values)

    for (const p of points) {
      const bucketId = Math.floor(p.timestamp / windowSizeMs) * windowSizeMs;
      if (!buckets.has(bucketId)) {
        buckets.set(bucketId, []);
      }
      buckets.get(bucketId).push(p.value);
    }

    const results = [];
    for (const [timestamp, values] of buckets.entries()) {
      let aggregatedValue = 0;
      switch (operator.toLowerCase()) {
        case 'sum':
          aggregatedValue = values.reduce((a, b) => a + b, 0);
          break;
        case 'min':
          aggregatedValue = Math.min(...values);
          break;
        case 'max':
          aggregatedValue = Math.max(...values);
          break;
        case 'count':
          aggregatedValue = values.length;
          break;
        case 'mean':
        default:
          aggregatedValue = values.reduce((a, b) => a + b, 0) / values.length;
          break;
      }
      results.push({ timestamp, value: aggregatedValue });
    }

    return results.sort((a, b) => a.timestamp - b.timestamp);
  }

  /**
   * Downsamples the historical metric entries, modifying data storage or returning a summary.
   */
  downsample(metric, bucketSizeMs, operator = 'mean') {
    const summary = this.aggregate(metric, bucketSizeMs, operator);
    const converted = summary.map(item => ({
      timestamp: item.timestamp,
      value: item.value,
      tags: { downsampled: true }
    }));

    // Replace the metric records with the downsampled representation
    this.series.set(metric, converted);
    return converted;
  }

  _evaluateAlerts(metric, dataPoint) {
    const rules = this.alertRules.get(metric) || [];
    for (const rule of rules) {
      let triggered = false;
      const val = dataPoint.value;
      const th = rule.threshold;

      switch (rule.operator) {
        case '>': triggered = val > th; break;
        case '>=': triggered = val >= th; break;
        case '<': triggered = val < th; break;
        case '<=': triggered = val <= th; break;
        case '==': triggered = val === th; break;
        case '!=': triggered = val !== th; break;
      }

      if (triggered) {
        try {
          rule.callback(dataPoint);
        } catch (err) {
          console.error(`Alert callback failed for metric "${metric}":`, err);
        }
      }
    }
  }

  _startPruneScheduler() {
    if (this.pruneInterval > 0) {
      this.timer = setInterval(() => {
        this._pruneExpired();
      }, this.pruneInterval);
      if (this.timer && this.timer.unref) {
        this.timer.unref(); // Don't block Node.js process exit
      }
    }
  }

  _pruneExpired() {
    const now = Date.now();
    for (const [metric, ttlMs] of this.retentionPolicies.entries()) {
      const points = this.series.get(metric);
      if (points) {
        const cutoff = now - ttlMs;
        // Since points are sorted by timestamp, filter out old points
        const remaining = points.filter(p => p.timestamp >= cutoff);
        this.series.set(metric, remaining);
      }
    }
  }

  destroy() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }
}
