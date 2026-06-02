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
});
