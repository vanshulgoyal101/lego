import { describe, it, expect } from '../../../test/test-harness.js';
import { HyperLogLog } from './index.js';

await describe('ds/hyperloglog', async () => {
  await it('should estimate cardinality within expected bounds', () => {
    const hll = new HyperLogLog(8); // 256 registers, ~6.5% standard error
    const elements = new Set();
    for (let i = 0; i < 200; i++) {
      const item = `user_${i}`;
      hll.add(item);
      elements.add(item);
    }

    const estimated = hll.count();
    const actual = elements.size;

    // Check that estimate is reasonably close (within 25% for test safety)
    const errorMargin = Math.abs(estimated - actual) / actual;
    expect(errorMargin < 0.25).toBe(true);
  });
});
