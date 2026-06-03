import { describe, it, expect } from '../../../test/test-harness.js';
import { ErrorAggregator, defaultFingerprint } from './index.js';

describe('observability/error-aggregator – defaultFingerprint', () => {
  it('should generate same fingerprint for similar errors', () => {
    const err1 = new TypeError('Cannot read property x of undefined');
    const err2 = new TypeError('Cannot read property x of undefined');
    
    // Set same stack to simulate same line
    err1.stack = 'TypeError: Cannot read property x of undefined\n    at index.js:10:5';
    err2.stack = 'TypeError: Cannot read property x of undefined\n    at index.js:10:5';

    expect(defaultFingerprint(err1)).toBe(defaultFingerprint(err2));
  });

  it('should generate different fingerprints for different error types or locations', () => {
    const err1 = new TypeError('Cannot read property x of undefined');
    const err2 = new ReferenceError('x is not defined');
    
    err1.stack = 'TypeError: Cannot read property x of undefined\n    at index.js:10:5';
    err2.stack = 'ReferenceError: x is not defined\n    at index.js:15:2';

    expect(defaultFingerprint(err1) !== defaultFingerprint(err2)).toBe(true);
  });
});

describe('observability/error-aggregator – ErrorAggregator', () => {
  it('should group, deduplicate, and track occurrence statistics', () => {
    const aggregator = new ErrorAggregator();
    
    const err1 = new Error('database failed');
    err1.stack = 'Error: database failed\n    at db.js:12:1';
    
    const err2 = new Error('database failed');
    err2.stack = 'Error: database failed\n    at db.js:12:1';

    aggregator.report(err1, { user: 'bob' });
    const report2 = aggregator.report(err2, { user: 'alice' });

    expect(report2.count).toBe(2);
    expect(report2.contexts.length).toBe(2);
    expect(report2.contexts[0].user).toBe('bob');
    expect(report2.contexts[1].user).toBe('alice');

    const list = aggregator.getErrors();
    expect(list.length).toBe(1);
    expect(list[0].sampleMessage).toBe('database failed');
  });

  it('should respect maxUniqueErrors configuration limit', () => {
    const aggregator = new ErrorAggregator({ maxUniqueErrors: 3 });
    aggregator.report('err-1');
    aggregator.report('err-2');
    aggregator.report('err-3');
    aggregator.report('err-4'); // trigger eviction of first

    const errors = aggregator.getErrors();
    expect(errors.length).toBe(3);
    expect(aggregator.getError('err-1')).toBe(null);
    expect(aggregator.getError('err-4') !== null).toBe(true);
  });
});
