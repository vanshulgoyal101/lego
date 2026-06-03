import { describe, it, expect } from '../../../test/test-harness.js';
import { RedBlackTree } from './index.js';

await describe('ds/red-black-tree', async () => {
  await it('should insert nodes and maintain red-black invariants', () => {
    const tree = new RedBlackTree();
    tree.insert(10, 'ten');
    tree.insert(20, 'twenty');
    tree.insert(30, 'thirty');
    tree.insert(15, 'fifteen');

    expect(tree.find(10)).toBe('ten');
    expect(tree.find(20)).toBe('twenty');
    expect(tree.find(30)).toBe('thirty');
    expect(tree.find(15)).toBe('fifteen');

    const ordered = tree.inorder();
    expect(ordered.length).toBe(4);
    expect(ordered[0].key).toBe(10);
    expect(ordered[1].key).toBe(15);
    expect(ordered[2].key).toBe(20);
    expect(ordered[3].key).toBe(30);

    // Root should be black
    expect(tree.root.color).toBe('BLACK');
  });
});
