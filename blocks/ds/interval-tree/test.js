import { describe, it, expect } from '../../../test/test-harness.js';
import { IntervalTree } from './index.js';

await describe('ds/interval-tree', async () => {
  await it('should find intervals containing a point', () => {
    const tree = new IntervalTree();
    tree.insert(1, 5, 'A');
    tree.insert(3, 8, 'B');
    tree.insert(10, 15, 'C');
    const hits = tree.query(4);
    const datas = hits.map(h => h.data).sort();
    expect(datas).toEqual(['A', 'B']);
  });

  await it('should return empty array for point outside all intervals', () => {
    const tree = new IntervalTree();
    tree.insert(1, 3);
    tree.insert(5, 7);
    expect(tree.query(4)).toEqual([]);
  });

  await it('should support point on boundary (closed intervals)', () => {
    const tree = new IntervalTree();
    tree.insert(1, 5);
    const r1 = tree.query(1);
    const r2 = tree.query(5);
    expect(r1.length).toBe(1);
    expect(r2.length).toBe(1);
  });

  await it('should find overlapping ranges', () => {
    const tree = new IntervalTree();
    tree.insert(1, 5, 'A');
    tree.insert(3, 8, 'B');
    tree.insert(10, 15, 'C');
    const hits = tree.queryRange(6, 11);
    const datas = hits.map(h => h.data).sort();
    expect(datas).toEqual(['B', 'C']);
  });

  await it('should delete an interval and not return it in queries', () => {
    const tree = new IntervalTree();
    tree.insert(1, 5, 'X');
    tree.insert(3, 8, 'Y');
    expect(tree.delete(1, 5)).toBe(true);
    expect(tree.query(4).map(h => h.data)).toEqual(['Y']);
  });

  await it('should return false when deleting non-existent interval', () => {
    const tree = new IntervalTree();
    tree.insert(1, 5);
    expect(tree.delete(2, 4)).toBe(false);
  });

  await it('should handle many intervals without error', () => {
    const tree = new IntervalTree();
    for (let i = 0; i < 50; i++) tree.insert(i, i + 10, i);
    const hits = tree.query(25);
    expect(hits.length).toBeGreaterThan(0);
  });
});
