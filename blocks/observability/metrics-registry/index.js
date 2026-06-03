/**
 * observability/metrics-registry
 *
 * In-process counter, gauge, and histogram metrics collector.
 * Exports metrics in the standard Prometheus exposition text format.
 */

function formatLabels(labels) {
  const keys = Object.keys(labels);
  if (keys.length === 0) return '';
  const pairs = keys.map(k => `${k}="${labels[k].toString().replace(/"/g, '\\"')}"`);
  return `{${pairs.join(',')}}`;
}

function getLabelKey(labels) {
  return Object.keys(labels)
    .sort()
    .map(k => `${k}:${labels[k]}`)
    .join('|');
}

export class Counter {
  constructor(name, help) {
    this.name = name;
    this.help = help;
    this.type = 'counter';
    this.values = new Map(); // labelKey -> { labels, value }
  }

  inc(val = 1, labels = {}) {
    if (val < 0) throw new Error('Counter increment value must be non-negative');
    const key = getLabelKey(labels);
    const existing = this.values.get(key) || { labels, value: 0 };
    existing.value += val;
    this.values.set(key, existing);
  }

  toString() {
    let out = `# HELP ${this.name} ${this.help}\n# TYPE ${this.name} counter\n`;
    if (this.values.size === 0) {
      out += `${this.name} 0\n`;
    } else {
      for (const entry of this.values.values()) {
        out += `${this.name}${formatLabels(entry.labels)} ${entry.value}\n`;
      }
    }
    return out;
  }
}

export class Gauge {
  constructor(name, help) {
    this.name = name;
    this.help = help;
    this.type = 'gauge';
    this.values = new Map(); // labelKey -> { labels, value }
  }

  set(val, labels = {}) {
    const key = getLabelKey(labels);
    this.values.set(key, { labels, value: Number(val) });
  }

  inc(val = 1, labels = {}) {
    const key = getLabelKey(labels);
    const existing = this.values.get(key) || { labels, value: 0 };
    existing.value += val;
    this.values.set(key, existing);
  }

  dec(val = 1, labels = {}) {
    const key = getLabelKey(labels);
    const existing = this.values.get(key) || { labels, value: 0 };
    existing.value -= val;
    this.values.set(key, existing);
  }

  toString() {
    let out = `# HELP ${this.name} ${this.help}\n# TYPE ${this.name} gauge\n`;
    if (this.values.size === 0) {
      out += `${this.name} 0\n`;
    } else {
      for (const entry of this.values.values()) {
        out += `${this.name}${formatLabels(entry.labels)} ${entry.value}\n`;
      }
    }
    return out;
  }
}

export class Histogram {
  constructor(name, help, options = {}) {
    this.name = name;
    this.help = help;
    this.type = 'histogram';
    this.buckets = options.buckets || [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10];
    this.values = new Map(); // labelKey -> { labels, sum, count, bucketCounts: Map }
  }

  observe(val, labels = {}) {
    const key = getLabelKey(labels);
    let entry = this.values.get(key);
    if (!entry) {
      entry = {
        labels,
        sum: 0,
        count: 0,
        bucketCounts: new Map(this.buckets.map(b => [b, 0]))
      };
      this.values.set(key, entry);
    }

    entry.sum += val;
    entry.count += 1;

    for (const bucket of this.buckets) {
      if (val <= bucket) {
        entry.bucketCounts.set(bucket, entry.bucketCounts.get(bucket) + 1);
      }
    }
  }

  toString() {
    let out = `# HELP ${this.name} ${this.help}\n# TYPE ${this.name} histogram\n`;
    if (this.values.size === 0) {
      // Print empty representation
      out += `${this.name}_sum 0\n`;
      out += `${this.name}_count 0\n`;
      for (const b of this.buckets) {
        out += `${this.name}_bucket{le="${b}"} 0\n`;
      }
      out += `${this.name}_bucket{le="+Inf"} 0\n`;
    } else {
      for (const entry of this.values.values()) {
        const labelsStr = formatLabels(entry.labels);
        const prefix = labelsStr ? labelsStr.slice(0, -1) + ',' : '{';

        let runningBucketCount = 0;
        for (const bucket of this.buckets) {
          const count = entry.bucketCounts.get(bucket);
          out += `${this.name}_bucket${prefix}le="${bucket}"} ${count}\n`;
        }
        out += `${this.name}_bucket${prefix}le="+Inf"} ${entry.count}\n`;
        out += `${this.name}_sum${labelsStr} ${entry.sum}\n`;
        out += `${this.name}_count${labelsStr} ${entry.count}\n`;
      }
    }
    return out;
  }
}

export class MetricsRegistry {
  constructor() {
    this.metrics = new Map();
  }

  register(metric) {
    if (this.metrics.has(metric.name)) {
      throw new Error(`Metric with name "${metric.name}" already registered`);
    }
    this.metrics.set(metric.name, metric);
    return metric;
  }

  counter(name, help) {
    return this.register(new Counter(name, help));
  }

  gauge(name, help) {
    return this.register(new Gauge(name, help));
  }

  histogram(name, help, options = {}) {
    return this.register(new Histogram(name, help, options));
  }

  get(name) {
    return this.metrics.get(name);
  }

  export() {
    let out = '';
    for (const metric of this.metrics.values()) {
      out += metric.toString();
    }
    return out;
  }

  clear() {
    this.metrics.clear();
  }
}
