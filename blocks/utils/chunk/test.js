import { describe, it, expect } from '../../../test/test-harness.js';
import { chunk, chunkBy, groupBy } from './index.js';

await describe('utils/chunk', async () => {
  await it('should chunk array into equal-size groups', () => {
    expect(chunk([1, 2, 3, 4], 2)).toEqual([[1, 2], [3, 4]]);
  });

  await it('should produce a smaller last chunk when not evenly divisible', () => {
    expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
  });

  await it('should return a single chunk when size >= array length', () => {
    expect(chunk([1, 2, 3], 10)).toEqual([[1, 2, 3]]);
  });

  await it('should return empty array for empty input', () => {
    expect(chunk([], 3)).toEqual([]);
  });

  await it('should chunk with size 1 (each element is own chunk)', () => {
    expect(chunk(['a', 'b', 'c'], 1)).toEqual([['a'], ['b'], ['c']]);
  });

  await it('should throw on non-array input', () => {
    expect(() => chunk('hello', 2)).toThrow('array');
  });

  await it('should throw on non-positive size', () => {
    expect(() => chunk([1, 2, 3], 0)).toThrow('positive integer');
    expect(() => chunk([1, 2, 3], -1)).toThrow('positive integer');
    expect(() => chunk([1, 2, 3], 1.5)).toThrow('positive integer');
  });

  await it('chunkBy should partition by predicate', () => {
    const [evens, odds] = chunkBy([1, 2, 3, 4, 5], x => x % 2 === 0);
    expect(evens).toEqual([2, 4]);
    expect(odds).toEqual([1, 3, 5]);
  });

  await it('chunkBy should handle all matching', () => {
    const [matched, unmatched] = chunkBy([2, 4, 6], x => x % 2 === 0);
    expect(matched).toEqual([2, 4, 6]);
    expect(unmatched).toEqual([]);
  });

  await it('chunkBy should handle none matching', () => {
    const [matched, unmatched] = chunkBy([1, 3, 5], x => x % 2 === 0);
    expect(matched).toEqual([]);
    expect(unmatched).toEqual([1, 3, 5]);
  });

  await it('chunkBy should throw on non-function predicate', () => {
    expect(() => chunkBy([1, 2], 'not a fn')).toThrow('function');
  });

  await it('groupBy should group elements by key function', () => {
    const result = groupBy(['one', 'two', 'three', 'on'], s => s.length);
    expect(result.get(3)).toEqual(['one', 'two']);
    expect(result.get(2)).toEqual(['on']);
    expect(result.get(5)).toEqual(['three']);
  });

  await it('groupBy should return empty Map for empty array', () => {
    const result = groupBy([], x => x);
    expect(result.size).toBe(0);
  });
});
