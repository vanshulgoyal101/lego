import { describe, it, expect } from '../../../test/test-harness.js';
import { withTimeout, sleep, retry, allSettledWithTimeout, firstFulfilled } from './index.js';

await describe('async/timeout-promise', async () => {
  await it('sleep should delay execution', async () => {
    const start = Date.now();
    await sleep(50);
    const elapsed = Date.now() - start;
    expect(elapsed).toBeGreaterThan(40);
  });

  await it('withTimeout should resolve for fast promises', async () => {
    const result = await withTimeout(Promise.resolve(42), 500);
    expect(result).toBe(42);
  });

  await it('withTimeout should reject for slow promises', async () => {
    let err = null;
    try {
      await withTimeout(sleep(500), 50, 'timed out');
    } catch (e) {
      err = e;
    }
    expect(err).toBeTruthy();
    expect(err.name).toBe('TimeoutError');
    expect(err.message).toBe('timed out');
  });

  await it('retry should succeed on first try', async () => {
    let calls = 0;
    const result = await retry(async () => { calls++; return 'ok'; });
    expect(result).toBe('ok');
    expect(calls).toBe(1);
  });

  await it('retry should retry on failure and eventually succeed', async () => {
    let calls = 0;
    const result = await retry(async () => {
      calls++;
      if (calls < 3) throw new Error('not yet');
      return 'done';
    }, { attempts: 5, delay: 10 });
    expect(result).toBe('done');
    expect(calls).toBe(3);
  });

  await it('retry should throw after all attempts exhausted', async () => {
    let err = null;
    try {
      await retry(async () => { throw new Error('always fails'); }, { attempts: 3, delay: 10 });
    } catch (e) {
      err = e;
    }
    expect(err).toBeTruthy();
    expect(err.message).toBe('always fails');
  });

  await it('retry should respect shouldRetry option', async () => {
    let calls = 0;
    let err = null;
    try {
      await retry(
        async () => { calls++; throw new Error('fatal'); },
        { attempts: 5, delay: 5, shouldRetry: () => false }
      );
    } catch (e) {
      err = e;
    }
    expect(calls).toBe(1); // shouldRetry returned false immediately
    expect(err.message).toBe('fatal');
  });

  await it('allSettledWithTimeout should return settled results', async () => {
    const results = await allSettledWithTimeout([
      Promise.resolve(1),
      Promise.reject(new Error('bad')),
      Promise.resolve(3),
    ], 1000);
    expect(results.length).toBe(3);
    expect(results[0].status).toBe('fulfilled');
    expect(results[1].status).toBe('rejected');
    expect(results[2].value).toBe(3);
  });

  await it('allSettledWithTimeout should timeout', async () => {
    let err = null;
    try {
      await allSettledWithTimeout([sleep(500)], 50);
    } catch (e) {
      err = e;
    }
    expect(err).toBeTruthy();
    expect(err.name).toBe('TimeoutError');
  });

  await it('firstFulfilled should return fastest resolved value', async () => {
    const result = await firstFulfilled([
      sleep(100).then(() => 'slow'),
      sleep(10).then(() => 'fast'),
    ]);
    expect(result).toBe('fast');
  });

  await it('firstFulfilled should reject when all promises reject', async () => {
    let err = null;
    try {
      await firstFulfilled([
        Promise.reject(new Error('a')),
        Promise.reject(new Error('b')),
      ]);
    } catch (e) {
      err = e;
    }
    expect(err).toBeTruthy();
    expect(err instanceof AggregateError).toBe(true);
  });
});
