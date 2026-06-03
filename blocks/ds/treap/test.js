import { describe, it, expect } from '../../../test/test-harness.js';
import { Treap } from './index.js';

await describe('ds/treap', async () => {
  await it('should insert, find, and maintain inorder keys', () => {
    const treap = new Treap();
    treap.insert(5, 'five', 0.9);
    treap.insert(2, 'two', 0.2);
    treap.insert(7, 'seven', 0.8);
    treap.insert(1, 'one', 0.1);
    treap.insert(8, 'eight', 0.5);

    expect(treap.find(5)).toBe('five');
    expect(treap.find(7)).toBe('seven');
    expect(treap.find(9)).toBe(undefined);

    const ordered = treap.inorder();
    expect(ordered.length).toBe(5);
    expect(ordered[0].key).toBe(1);
    expect(ordered[1].key).toBe(2);
    expect(ordered[2].key).toBe(5);
    expect(ordered[3].key).toBe(7);
    expect(ordered[4].key).toBe(8);
  });

  await it('should delete keys correctly', () => {
    const treap = new Treap();
    treap.insert(10, 'ten', 0.5);
    treap.insert(5, 'five', 0.8);
    treap.insert(15, 'fifteen', 0.2);

    expect(treap.contains(10)).toBe(true);
    treap.delete(10);
    expect(treap.contains(10)).toBe(false);
    expect(treap.contains(5)).toBe(true);
    expect(treap.contains(15)).toBe(true);
  });

  await it('should split the treap by key', () => {
    const treap = new Treap();
    treap.insert(10, 'A', 0.5);
    treap.insert(5, 'B', 0.8);
    treap.insert(15, 'C', 0.2);
    treap.insert(20, 'D', 0.9);

    const { left, right } = treap.split(12);

    expect(left.contains(5)).toBe(true);
    expect(left.contains(10)).toBe(true);
    expect(left.contains(15)).toBe(false);

    expect(right.contains(15)).toBe(true);
    expect(right.contains(20)).toBe(true);
    expect(right.contains(10)).toBe(false);
  });
});
