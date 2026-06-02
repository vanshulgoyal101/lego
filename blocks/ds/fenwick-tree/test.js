import { describe, it, expect } from '../../../test/test-harness.js';
import { FenwickTree } from './index.js';

await describe('ds/fenwick-tree', async () => {
  await it('should initialize and perform range queries correctly', () => {
    const arr = [1, 7, 3, 0, 5, 8, 3];
    const tree = new FenwickTree(arr);

    expect(tree.queryRange(0, 6)).toBe(27);
    expect(tree.queryRange(1, 4)).toBe(15);

    tree.add(3, 10); // Update index 3: was 0, now becomes 10 (delta = 10)
    expect(tree.queryRange(1, 4)).toBe(25);
  });
});
