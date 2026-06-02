import { describe, it, expect } from '../../../test/test-harness.js';
import { apply, diff, validate } from './index.js';

await describe('encoding/json-patch', async () => {

  // ─── apply ───────────────────────────────────────────────────────────────

  await it('apply: add operation inserts a new key', () => {
    const result = apply({ a: 1 }, [{ op: 'add', path: '/b', value: 2 }]);
    expect(result).toEqual({ a: 1, b: 2 });
  });

  await it('apply: add operation appends to array with "-"', () => {
    const result = apply({ arr: [1, 2] }, [{ op: 'add', path: '/arr/-', value: 3 }]);
    expect(result).toEqual({ arr: [1, 2, 3] });
  });

  await it('apply: remove operation deletes a key', () => {
    const result = apply({ a: 1, b: 2 }, [{ op: 'remove', path: '/b' }]);
    expect(result).toEqual({ a: 1 });
  });

  await it('apply: replace operation updates an existing key', () => {
    const result = apply({ a: 1 }, [{ op: 'replace', path: '/a', value: 99 }]);
    expect(result).toEqual({ a: 99 });
  });

  await it('apply: copy duplicates a value to a new path', () => {
    const result = apply({ a: 42, b: 0 }, [{ op: 'copy', from: '/a', path: '/c' }]);
    expect(result).toEqual({ a: 42, b: 0, c: 42 });
  });

  await it('apply: move relocates a value', () => {
    const result = apply({ a: 42, b: 0 }, [{ op: 'move', from: '/a', path: '/b' }]);
    expect(result).toEqual({ b: 42 });
  });

  await it('apply: test operation passes when value matches', () => {
    const result = apply({ a: 1 }, [{ op: 'test', path: '/a', value: 1 }]);
    expect(result).toEqual({ a: 1 });
  });

  await it('apply: test operation throws when value does not match', () => {
    expect(() => apply({ a: 1 }, [{ op: 'test', path: '/a', value: 99 }])).toThrow('Test failed');
  });

  await it('apply: multiple operations are applied in order', () => {
    const result = apply({}, [
      { op: 'add', path: '/x', value: 1 },
      { op: 'add', path: '/y', value: 2 },
      { op: 'replace', path: '/x', value: 10 },
    ]);
    expect(result).toEqual({ x: 10, y: 2 });
  });

  await it('apply: nested paths work correctly', () => {
    const doc = { a: { b: { c: 1 } } };
    const result = apply(doc, [{ op: 'replace', path: '/a/b/c', value: 99 }]);
    expect(result).toEqual({ a: { b: { c: 99 } } });
  });

  await it('apply: does not mutate the original document', () => {
    const original = { a: 1 };
    apply(original, [{ op: 'add', path: '/b', value: 2 }]);
    expect(original).toEqual({ a: 1 });
  });

  // ─── diff ────────────────────────────────────────────────────────────────

  await it('diff generates add for new keys', () => {
    const ops = diff({ a: 1 }, { a: 1, b: 2 });
    expect(ops).toEqual([{ op: 'add', path: '/b', value: 2 }]);
  });

  await it('diff generates remove for deleted keys', () => {
    const ops = diff({ a: 1, b: 2 }, { a: 1 });
    expect(ops).toEqual([{ op: 'remove', path: '/b' }]);
  });

  await it('diff generates replace for changed values', () => {
    const ops = diff({ a: 1 }, { a: 2 });
    expect(ops).toEqual([{ op: 'replace', path: '/a', value: 2 }]);
  });

  await it('diff roundtrip: applying the diff reproduces the modified doc', () => {
    const original = { name: 'Alice', age: 30, city: 'NY' };
    const modified  = { name: 'Bob', age: 30, country: 'US' };
    const patch = diff(original, modified);
    expect(apply(original, patch)).toEqual(modified);
  });

  await it('diff returns empty array for identical documents', () => {
    expect(diff({ a: 1 }, { a: 1 })).toEqual([]);
  });

  // ─── validate ────────────────────────────────────────────────────────────

  await it('validate accepts a valid patch', () => {
    const result = validate([{ op: 'add', path: '/x', value: 1 }]);
    expect(result.valid).toBe(true);
    expect(result.errors.length).toBe(0);
  });

  await it('validate rejects op without required value field', () => {
    const result = validate([{ op: 'add', path: '/x' }]);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  await it('validate rejects unknown op', () => {
    const result = validate([{ op: 'upsert', path: '/x', value: 1 }]);
    expect(result.valid).toBe(false);
  });

  await it('validate rejects copy/move without from field', () => {
    const result = validate([{ op: 'move', path: '/y' }]);
    expect(result.valid).toBe(false);
  });

  await it('validate returns error when patch is not an array', () => {
    const result = validate({});
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toBe('Patch must be an array');
  });
});
