import { describe, it, expect } from '../../../test/test-harness.js';
import { quickselect } from './index.js';

await describe('algo/quickselect', async () => {
  await it('should find the correct order statistic elements', () => {
    const arr = [9, 3, 2, 7, 6, 1, 5, 8, 4];

    expect(quickselect([...arr], 0)).toBe(1); // Min
    expect(quickselect([...arr], 8)).toBe(9); // Max
    expect(quickselect([...arr], 4)).toBe(5); // Median
    expect(quickselect([...arr], 2)).toBe(3); // 3rd smallest
  });

  await it('should throw error for out of bounds bounds k', () => {
    expect(() => quickselect([1, 2, 3], -1)).toThrow('Index k is out of bounds');
    expect(() => quickselect([1, 2, 3], 3)).toThrow('Index k is out of bounds');
  });
});
