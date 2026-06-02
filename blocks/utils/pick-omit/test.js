import { describe, it, expect } from '../../../test/test-harness.js';
import { pick, omit, pickBy, omitBy, renameKeys } from './index.js';

await describe('utils/pick-omit', async () => {
  const obj = { a: 1, b: 2, c: 3, d: 4 };

  await it('pick should return only specified keys', () => {
    expect(pick(obj, ['a', 'c'])).toEqual({ a: 1, c: 3 });
  });

  await it('pick should ignore keys that do not exist', () => {
    expect(pick(obj, ['a', 'z'])).toEqual({ a: 1 });
  });

  await it('pick should return empty object for empty keys array', () => {
    expect(pick(obj, [])).toEqual({});
  });

  await it('pick should not mutate the source object', () => {
    const source = { x: 1, y: 2 };
    const result = pick(source, ['x']);
    result.x = 999;
    expect(source.x).toBe(1);
  });

  await it('pick should throw on non-object input', () => {
    expect(() => pick(null, ['a'])).toThrow('object');
    expect(() => pick('str', ['a'])).toThrow('object');
  });

  await it('omit should exclude specified keys', () => {
    expect(omit(obj, ['b', 'd'])).toEqual({ a: 1, c: 3 });
  });

  await it('omit should handle non-existent keys gracefully', () => {
    expect(omit(obj, ['z'])).toEqual(obj);
  });

  await it('omit should return all keys when keys array is empty', () => {
    expect(omit(obj, [])).toEqual(obj);
  });

  await it('omit should not mutate the source object', () => {
    const source = { x: 1, y: 2 };
    omit(source, ['x']);
    expect(source).toEqual({ x: 1, y: 2 });
  });

  await it('pickBy should select keys where predicate is truthy', () => {
    expect(pickBy({ a: 1, b: 0, c: 2 }, v => v > 0)).toEqual({ a: 1, c: 2 });
  });

  await it('pickBy should pass key as second argument to predicate', () => {
    const result = pickBy({ x: 1, y: 2, z: 3 }, (v, k) => k !== 'y');
    expect(result).toEqual({ x: 1, z: 3 });
  });

  await it('pickBy should return empty object when no keys match', () => {
    expect(pickBy({ a: 1 }, v => v > 100)).toEqual({});
  });

  await it('pickBy should throw on non-function predicate', () => {
    expect(() => pickBy(obj, 'not a fn')).toThrow('function');
  });

  await it('omitBy should exclude keys where predicate is truthy', () => {
    expect(omitBy({ a: 1, b: null, c: undefined }, v => v == null)).toEqual({ a: 1 });
  });

  await it('omitBy should return full object when no keys match predicate', () => {
    expect(omitBy({ a: 1, b: 2 }, v => v > 100)).toEqual({ a: 1, b: 2 });
  });

  await it('renameKeys should rename specified keys', () => {
    expect(renameKeys({ firstName: 'Ada', age: 36 }, { firstName: 'name' }))
      .toEqual({ name: 'Ada', age: 36 });
  });

  await it('renameKeys should leave unmapped keys unchanged', () => {
    expect(renameKeys({ a: 1, b: 2 }, { a: 'x' })).toEqual({ x: 1, b: 2 });
  });

  await it('renameKeys should handle empty key map', () => {
    expect(renameKeys({ a: 1 }, {})).toEqual({ a: 1 });
  });
});
