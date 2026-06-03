import { describe, it, expect } from '../../../test/test-harness.js';
import { RateLimiter, rateLimit } from './index.js';

const sleep = ms => new Promise(r => setTimeout(r, ms));

await describe('async/rate-limiter', async () => {
  await it('should allow calls within the limit', async () => {
    const limiter = new RateLimiter(5, 1000);
    const limited = limiter.throttle(async x => x * 2);
    const results = await Promise.all([1, 2, 3].map(x => limited(x)));
    expect(results).toEqual([2, 4, 6]);
  });

  await it('should enforce the rate limit by queuing excess calls', async () => {
    const limiter = new RateLimiter(2, 200); // 2 per 200ms
    const timestamps = [];
    const fn = async () => { timestamps.push(Date.now()); };
    const limited = limiter.throttle(fn);

    await Promise.all([limited(), limited(), limited(), limited()]);

    // First 2 should happen quickly, next 2 after ~200ms
    expect(timestamps.length).toBe(4);
    const gap = timestamps[2] - timestamps[0];
    expect(gap).toBeGreaterThan(150); // at least 150ms gap for the 3rd call
  });

  await it('remaining should reflect available tokens', async () => {
    const limiter = new RateLimiter(5, 1000);
    expect(limiter.remaining).toBe(5);
    limiter.throttle(async () => {})();
    limiter.throttle(async () => {})();
    // After 2 calls, 3 should remain
    await sleep(10); // let the microtasks settle
    expect(limiter.remaining).toBeLessThanOrEqual(4);
  });

  await it('reset should clear call history', async () => {
    const limiter = new RateLimiter(3, 1000);
    limiter.throttle(async () => {})();
    limiter.throttle(async () => {})();
    limiter.throttle(async () => {})();
    await sleep(10);
    limiter.reset();
    expect(limiter.remaining).toBe(3);
  });

  await it('rateLimit should wrap a function correctly', async () => {
    const calls = [];
    const fn = async x => { calls.push(x); return x; };
    const limited = rateLimit(fn, { limit: 5, interval: 1000 });
    const results = await Promise.all([1, 2, 3].map(x => limited(x)));
    expect(results).toEqual([1, 2, 3]);
    expect(calls).toEqual([1, 2, 3]);
  });

  await it('should propagate errors from the wrapped function', async () => {
    const limiter = new RateLimiter(5, 1000);
    const limited = limiter.throttle(async () => { throw new Error('fail'); });
    let caught = null;
    try { await limited(); } catch (e) { caught = e; }
    expect(caught).toBeTruthy();
    expect(caught.message).toBe('fail');
  });

  await it('should configure new limits dynamically', async () => {
    const limiter = new RateLimiter(5, 1000);
    limiter.configure(2, 200);
    expect(limiter.limit).toBe(2);
    expect(limiter.interval).toBe(200);
  });
});
