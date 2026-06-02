import { describe, it, expect } from '../../../test/test-harness.js';
import { SparseTable } from './index.js';

await describe('ds/sparse-table', async () => {
  await it('should find range minimum correctly', () => {
    const st = new SparseTable([3, 1, 4, 1, 5, 9, 2, 6], 'min');
    expect(st.query(0, 7)).toBe(1);
    expect(st.query(4, 7)).toBe(2);
    expect(st.query(0, 2)).toBe(1);
  });

  await it('should find range maximum correctly', () => {
    const st = new SparseTable([3, 1, 4, 1, 5, 9, 2, 6], 'max');
    expect(st.query(0, 7)).toBe(9);
    expect(st.query(0, 4)).toBe(5);
    expect(st.query(6, 7)).toBe(6);
  });

  await it('should handle single-element queries', () => {
    const st = new SparseTable([7, 3, 9], 'min');
    expect(st.query(0, 0)).toBe(7);
    expect(st.query(1, 1)).toBe(3);
    expect(st.query(2, 2)).toBe(9);
  });

  await it('should handle a single-element array', () => {
    const st = new SparseTable([42], 'max');
    expect(st.query(0, 0)).toBe(42);
  });

  await it('should report correct length and mode', () => {
    const st = new SparseTable([1, 2, 3], 'min');
    expect(st.length).toBe(3);
    expect(st.mode).toBe('min');
  });

  await it('should throw on invalid mode', () => {
    let threw = false;
    try { new SparseTable([1, 2], 'avg'); } catch (e) { threw = true; }
    expect(threw).toBe(true);
  });

  await it('should throw on out-of-range query', () => {
    const st = new SparseTable([1, 2, 3], 'max');
    let threw = false;
    try { st.query(-1, 2); } catch (e) { threw = true; }
    expect(threw).toBe(true);
  });

  await it('should throw on empty array', () => {
    let threw = false;
    try { new SparseTable([], 'min'); } catch (e) { threw = true; }
    expect(threw).toBe(true);
  });
});
