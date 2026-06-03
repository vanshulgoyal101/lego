import { describe, it, expect } from '../../../test/test-harness.js';
import { TokenBucketLimiter } from './index.js';

await describe('web/rate-limiter-token-bucket', async () => {
  await it('should consume tokens, limit requests when exhausted, refill over time, and isolate keys', async () => {
    // Capacity 3, refill rate 10 tokens per second (1 token per 100ms)
    const limiter = new TokenBucketLimiter(3, 10);

    // 1. Consume up to capacity
    expect(limiter.consume('user1')).toBe(true);
    expect(limiter.consume('user1')).toBe(true);
    expect(limiter.consume('user1')).toBe(true);

    // 2. Consume over capacity should be denied
    expect(limiter.consume('user1')).toBe(false);

    // 3. User2 should be unaffected (Key isolation)
    expect(limiter.consume('user2')).toBe(true);

    // 4. Wait for refill (150ms should refill at least 1 token)
    await new Promise(resolve => setTimeout(resolve, 150));
    expect(limiter.consume('user1')).toBe(true);
  });

  await it('should clean up stale idle buckets to prevent memory leaks', async () => {
    // Capacity 1, refill 100/sec. Fully refilled in 10ms.
    const limiter = new TokenBucketLimiter(1, 100);
    limiter.consume('user1');
    limiter.consume('user2');
    expect(limiter.buckets.size).toBe(2);

    // Wait 20ms for full refill, then clean up
    await new Promise(resolve => setTimeout(resolve, 20));
    limiter.cleanup();
    expect(limiter.buckets.size).toBe(0);
  });
});
