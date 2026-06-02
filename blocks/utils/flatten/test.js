import { describe, it, expect } from '../../../test/test-harness.js';
import { flatten, flattenDeep, nestingDepth, flattenOnce } from './index.js';

await describe('utils/flatten', async () => {
  await it('should flatten one level by default', () => {
    expect(flatten([1, [2, 3], [4]])).toEqual([1, 2, 3, 4]);
  });

  await it('should not flatten beyond depth 1 by default', () => {
    expect(flatten([1, [2, [3, 4]]])).toEqual([1, 2, [3, 4]]);
  });

  await it('should flatten to specified depth', () => {
    expect(flatten([1, [2, [3, [4]]]], 2)).toEqual([1, 2, 3, [4]]);
    expect(flatten([1, [2, [3, [4]]]], 3)).toEqual([1, 2, 3, 4]);
  });

  await it('should flatten with depth 0 (no flattening)', () => {
    const arr = [1, [2, 3]];
    expect(flatten(arr, 0)).toEqual([1, [2, 3]]);
  });

  await it('should handle empty arrays', () => {
    expect(flatten([])).toEqual([]);
    expect(flatten([[], []])).toEqual([]);
  });

  await it('should handle already flat arrays', () => {
    expect(flatten([1, 2, 3])).toEqual([1, 2, 3]);
  });

  await it('should throw on non-array input', () => {
    expect(() => flatten('not an array')).toThrow('array');
  });

  await it('flattenDeep should flatten infinitely', () => {
    const deep = [1, [2, [3, [4, [5, [6]]]]]];
    expect(flattenDeep(deep)).toEqual([1, 2, 3, 4, 5, 6]);
  });

  await it('flattenDeep should handle empty nested arrays', () => {
    expect(flattenDeep([[], [[], []]])).toEqual([]);
  });

  await it('nestingDepth should return 1 for flat array', () => {
    expect(nestingDepth([1, 2, 3])).toBe(1);
  });

  await it('nestingDepth should return correct depth for nested array', () => {
    expect(nestingDepth([1, [2, [3]]])).toBe(3);
    expect(nestingDepth([[[[]]]])).toBe(4);
  });

  await it('nestingDepth should return 0 for non-array', () => {
    expect(nestingDepth('hello')).toBe(0);
  });

  await it('flattenOnce should flatten exactly one level', () => {
    expect(flattenOnce([[1, 2], [3, 4], [5]])).toEqual([1, 2, 3, 4, 5]);
  });

  await it('flattenOnce should include non-array elements as-is', () => {
    expect(flattenOnce([1, [2, 3], 4])).toEqual([1, 2, 3, 4]);
  });

  await it('flattenOnce should throw on non-array input', () => {
    expect(() => flattenOnce(42)).toThrow('array');
  });
});
