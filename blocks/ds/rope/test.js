import { describe, it, expect } from '../../../test/test-harness.js';
import { Rope } from './index.js';

await describe('ds/rope', async () => {
  await it('should store and return a string', () => {
    const r = new Rope('Hello');
    expect(r.toString()).toBe('Hello');
    expect(r.length).toBe(5);
  });

  await it('should concatenate two ropes', () => {
    const r1 = new Rope('Hello, ');
    const r2 = new Rope('World!');
    const r3 = r1.concat(r2);
    expect(r3.toString()).toBe('Hello, World!');
    expect(r3.length).toBe(13);
  });

  await it('should access characters by index', () => {
    const r = new Rope('abcdef');
    expect(r.charAt(0)).toBe('a');
    expect(r.charAt(3)).toBe('d');
    expect(r.charAt(5)).toBe('f');
  });

  await it('should return empty string for out-of-bounds charAt', () => {
    const r = new Rope('abc');
    expect(r.charAt(-1)).toBe('');
    expect(r.charAt(10)).toBe('');
  });

  await it('should split a rope at a given index', () => {
    const r = new Rope('Hello, World!');
    const [left, right] = r.split(7);
    expect(left.toString()).toBe('Hello, ');
    expect(right.toString()).toBe('World!');
  });

  await it('should split at index 0', () => {
    const r = new Rope('Hello');
    const [left, right] = r.split(0);
    expect(left.toString()).toBe('');
    expect(right.toString()).toBe('Hello');
  });

  await it('should split at last index (full string left)', () => {
    const r = new Rope('Hello');
    const [left, right] = r.split(5);
    expect(left.toString()).toBe('Hello');
    expect(right.toString()).toBe('');
  });

  await it('should handle empty rope', () => {
    const r = new Rope('');
    expect(r.toString()).toBe('');
    expect(r.length).toBe(0);
  });

  await it('should chain multiple concats correctly', () => {
    const a = new Rope('foo');
    const b = new Rope('bar');
    const c = new Rope('baz');
    const result = a.concat(b).concat(c);
    expect(result.toString()).toBe('foobarbaz');
    expect(result.length).toBe(9);
  });
});
