import { describe, it, expect } from '../../../test/test-harness.js';
import { deepMerge, merge } from './index.js';

await describe('utils/deep-merge', async () => {
  await it('should merge flat objects', () => {
    const result = deepMerge({ a: 1 }, { b: 2 });
    expect(result).toEqual({ a: 1, b: 2 });
  });

  await it('should deep merge nested objects', () => {
    const result = deepMerge({ a: { b: 1, c: 2 } }, { a: { c: 99, d: 4 } });
    expect(result).toEqual({ a: { b: 1, c: 99, d: 4 } });
  });

  await it('should not mutate source objects', () => {
    const a = { x: { y: 1 } };
    const b = { x: { z: 2 } };
    deepMerge(a, b);
    expect(a).toEqual({ x: { y: 1 } });
    expect(b).toEqual({ x: { z: 2 } });
  });

  await it('should merge three or more objects', () => {
    const result = deepMerge({ a: 1 }, { b: 2 }, { c: 3 });
    expect(result).toEqual({ a: 1, b: 2, c: 3 });
  });

  await it('should replace arrays by default', () => {
    const result = deepMerge({ tags: ['a', 'b'] }, { tags: ['c'] });
    expect(result).toEqual({ tags: ['c'] });
  });

  await it('should concatenate arrays when arrayMerge is concat', () => {
    const result = deepMerge({ tags: ['a', 'b'] }, { tags: ['c'] }, { arrayMerge: 'concat' });
    expect(result).toEqual({ tags: ['a', 'b', 'c'] });
  });

  await it('should handle empty objects', () => {
    expect(deepMerge({}, {})).toEqual({});
    expect(deepMerge({ a: 1 }, {})).toEqual({ a: 1 });
    expect(deepMerge({}, { b: 2 })).toEqual({ b: 2 });
  });

  await it('should return empty object with no arguments', () => {
    expect(deepMerge()).toEqual({});
  });

  await it('should overwrite primitives from left to right', () => {
    const result = deepMerge({ a: 1 }, { a: 2 }, { a: 3 });
    expect(result.a).toBe(3);
  });

  await it('merge() convenience wrapper works', () => {
    const result = merge({ a: { b: 1 } }, { a: { c: 2 } });
    expect(result).toEqual({ a: { b: 1, c: 2 } });
  });

  await it('merge() supports concat option', () => {
    const result = merge({ arr: [1, 2] }, { arr: [3] }, { arrayMerge: 'concat' });
    expect(result).toEqual({ arr: [1, 2, 3] });
  });

  await it('should handle deeply nested objects', () => {
    const a = { a: { b: { c: { d: 1 } } } };
    const b = { a: { b: { c: { e: 2 } } } };
    const result = deepMerge(a, b);
    expect(result).toEqual({ a: { b: { c: { d: 1, e: 2 } } } });
  });
});
