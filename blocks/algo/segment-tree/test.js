import { describe, it, expect } from '../../../test/test-harness.js';
import {SegmentTree, FenwickTree} from './index.js';

  await describe('algo/segment-tree', async () => {
    await it('should compute range sum correctly', () => {
      const st = new SegmentTree([1, 3, 5, 7, 9, 11]);
      expect(st.query(0, 2)).toBe(9);  // 1+3+5
      expect(st.query(1, 4)).toBe(24); // 3+5+7+9
      expect(st.query(0, 5)).toBe(36); // total
    });

    await it('should update a value and recompute', () => {
      const st = new SegmentTree([1, 2, 3, 4]);
      st.update(1, 10); // [1, 10, 3, 4]
      expect(st.query(0, 3)).toBe(18);
      expect(st.query(1, 2)).toBe(13);
    });

    await it('should compute range min', () => {
      const st = new SegmentTree([5, 3, 8, 1, 4], 'min');
      expect(st.query(0, 4)).toBe(1);
      expect(st.query(0, 2)).toBe(3);
      st.update(3, 10);
      expect(st.query(0, 4)).toBe(3);
    });

    await it('should compute range max', () => {
      const st = new SegmentTree([5, 3, 8, 1, 4], 'max');
      expect(st.query(0, 4)).toBe(8);
      expect(st.query(0, 1)).toBe(5);
    });

    await it('should support Fenwick Tree prefix sums', () => {
      const ft = new FenwickTree(6);
      ft.update(1, 3); ft.update(2, 2); ft.update(3, -1); ft.update(4, 6); ft.update(5, 1);
      expect(ft.prefixSum(3)).toBe(4); // 3+2-1
      expect(ft.rangeSum(2, 4)).toBe(7); // 2+(-1)+6
    });
  });
