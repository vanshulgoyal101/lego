import { describe, it, expect } from '../../../test/test-harness.js';
import { MetricsRegistry, Counter, Gauge, Histogram } from './index.js';

describe('observability/metrics-registry – Counter', () => {
  it('should increment correctly with and without labels', () => {
    const counter = new Counter('http_requests_total', 'Total HTTP requests');
    counter.inc();
    counter.inc(2, { method: 'GET', status: '200' });

    const str = counter.toString();
    expect(str).toContain('http_requests_total 1');
    expect(str).toContain('http_requests_total{method="GET",status="200"} 2');
  });

  it('should throw when incrementing by a negative value', () => {
    const counter = new Counter('test', 'test help');
    let threw = false;
    try {
      counter.inc(-1);
    } catch {
      threw = true;
    }
    expect(threw).toBe(true);
  });
});

describe('observability/metrics-registry – Gauge', () => {
  it('should set, increment, and decrement values correctly', () => {
    const gauge = new Gauge('active_connections', 'Active user connections');
    gauge.set(10);
    gauge.inc(2, { region: 'us-east' });
    gauge.dec(1, { region: 'us-east' });

    const str = gauge.toString();
    expect(str).toContain('active_connections 10');
    expect(str).toContain('active_connections{region="us-east"} 1');
  });
});

describe('observability/metrics-registry – Histogram', () => {
  it('should place values into correct buckets', () => {
    const histogram = new Histogram('request_duration_seconds', 'Duration help', {
      buckets: [0.1, 0.5, 1.0]
    });

    histogram.observe(0.05, { path: '/api' });
    histogram.observe(0.3, { path: '/api' });
    histogram.observe(1.5, { path: '/api' });

    const str = histogram.toString();
    expect(str).toContain('request_duration_seconds_bucket{path="/api",le="0.1"} 1');
    expect(str).toContain('request_duration_seconds_bucket{path="/api",le="0.5"} 2');
    expect(str).toContain('request_duration_seconds_bucket{path="/api",le="1"} 2');
    expect(str).toContain('request_duration_seconds_bucket{path="/api",le="+Inf"} 3');
    expect(str).toContain('request_duration_seconds_sum{path="/api"} 1.85');
    expect(str).toContain('request_duration_seconds_count{path="/api"} 3');
  });
});

describe('observability/metrics-registry – MetricsRegistry', () => {
  it('should register and export all metrics', () => {
    const registry = new MetricsRegistry();
    const c = registry.counter('test_counter', 'counter help');
    const g = registry.gauge('test_gauge', 'gauge help');

    c.inc();
    g.set(5);

    const exported = registry.export();
    expect(exported).toContain('test_counter 1');
    expect(exported).toContain('test_gauge 5');
  });

  it('should throw on registering duplicate metric names', () => {
    const registry = new MetricsRegistry();
    registry.counter('dup', 'help');
    let threw = false;
    try {
      registry.gauge('dup', 'help');
    } catch {
      threw = true;
    }
    expect(threw).toBe(true);
  });
});
