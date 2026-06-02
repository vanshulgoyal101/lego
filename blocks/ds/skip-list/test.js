import { describe, it, expect } from '../../../test/test-harness.js';
import { SkipList } from './index.js';

await describe('ds/skip-list', async () => {
  await it('should insert and retrieve values in sorted order', () => {
    const sl = new SkipList();
    sl.insert(5);
    sl.insert(2);
    sl.insert(8);
    sl.insert(1);
    sl.insert(9);
    expect(sl.toArray()).toEqual([1, 2, 5, 8, 9]);
  });

  await it('should find existing values and not find missing ones', () => {
    const sl = new SkipList();
    sl.insert(10);
    sl.insert(20);
    sl.insert(30);
    expect(sl.search(20)).toBe(true);
    expect(sl.search(15)).toBe(false);
  });

  await it('should delete existing values correctly', () => {
    const sl = new SkipList();
    sl.insert(3);
    sl.insert(1);
    sl.insert(2);
    expect(sl.delete(2)).toBe(true);
    expect(sl.toArray()).toEqual([1, 3]);
    expect(sl.search(2)).toBe(false);
  });

  await it('should return false when deleting a non-existent value', () => {
    const sl = new SkipList();
    sl.insert(1);
    expect(sl.delete(99)).toBe(false);
  });

  await it('should ignore duplicate inserts', () => {
    const sl = new SkipList();
    sl.insert(5);
    sl.insert(5);
    sl.insert(5);
    expect(sl.toArray()).toEqual([5]);
    expect(sl.size).toBe(1);
  });

  await it('should track size correctly', () => {
    const sl = new SkipList();
    expect(sl.size).toBe(0);
    sl.insert(1);
    sl.insert(2);
    expect(sl.size).toBe(2);
    sl.delete(1);
    expect(sl.size).toBe(1);
  });

  await it('should handle large sequential inserts in sorted order', () => {
    const sl = new SkipList();
    for (let i = 100; i >= 1; i--) sl.insert(i);
    const arr = sl.toArray();
    expect(arr.length).toBe(100);
    expect(arr[0]).toBe(1);
    expect(arr[99]).toBe(100);
  });
});
