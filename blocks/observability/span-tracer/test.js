import { describe, it, expect } from '../../../test/test-harness.js';
import { Span, SpanTracer } from './index.js';

describe('observability/span-tracer – Span', () => {
  it('should initialize with a name and generate unique IDs', () => {
    const span = new Span('test-span');
    expect(span.name).toBe('test-span');
    expect(typeof span.traceId).toBe('string');
    expect(span.traceId.length).toBe(32);
    expect(typeof span.spanId).toBe('string');
    expect(span.spanId.length).toBe(16);
    expect(span.parentId).toBe(null);
  });

  it('should support attributes and events', () => {
    const span = new Span('db-query');
    span.setAttribute('db.type', 'sql');
    span.setAttributes({ 'db.statement': 'SELECT * FROM users', status: 200 });

    expect(span.attributes['db.type']).toBe('sql');
    expect(span.attributes['db.statement']).toBe('SELECT * FROM users');

    span.addEvent('connection_acquired', { time_ms: 12 });
    expect(span.events.length).toBe(1);
    expect(span.events[0].name).toBe('connection_acquired');
    expect(span.events[0].attributes.time_ms).toBe(12);
  });

  it('should set status and handle end times', async () => {
    const span = new Span('process-job');
    expect(span.status.code).toBe('UNSET');
    expect(span.isEnded()).toBe(false);

    span.setStatus('OK');
    expect(span.status.code).toBe('OK');

    span.end();
    expect(span.isEnded()).toBe(true);
    expect(span.getDuration() >= 0).toBe(true);
  });

  it('should serialize to and from W3C traceparent headers', () => {
    const span = new Span('http-request');
    const header = span.toTraceParent();

    expect(header.startsWith('00-')).toBe(true);

    const parsed = Span.fromTraceParent(header);
    expect(parsed.traceId).toBe(span.traceId);
    expect(parsed.parentId).toBe(span.spanId);
    expect(parsed.traceFlags).toBe('01');
  });

  it('should return null for invalid traceparent headers', () => {
    expect(Span.fromTraceParent('invalid')).toBe(null);
    expect(Span.fromTraceParent('00-short-id-flags')).toBe(null);
    expect(Span.fromTraceParent('01-abc-123-01')).toBe(null); // non-supported version
  });
});

describe('observability/span-tracer – SpanTracer', () => {
  it('should track spans and support parent hierarchy', () => {
    const tracer = new SpanTracer();
    const parent = tracer.startSpan('main-process');
    const child = tracer.startSpan('sub-process', { parent });

    expect(child.traceId).toBe(parent.traceId);
    expect(child.parentId).toBe(parent.spanId);

    const spans = tracer.getSpans();
    expect(spans.length).toBe(2);
    expect(spans[0]).toBe(parent);
    expect(spans[1]).toBe(child);

    tracer.clear();
    expect(tracer.getSpans().length).toBe(0);
  });

  it('should support parent hierarchy from a traceparent string', () => {
    const tracer = new SpanTracer();
    const traceparent = '00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01';

    const span = tracer.startSpan('incoming-http', { parent: traceparent });
    expect(span.traceId).toBe('4bf92f3577b34da6a3ce929d0e0e4736');
    expect(span.parentId).toBe('00f067aa0ba902b7');
  });
});
