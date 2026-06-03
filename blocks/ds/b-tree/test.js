import { describe, it, expect } from '../../../test/test-harness.js';
import { BTree } from './index.js';

await describe('ds/b-tree', async () => {
  await it('should insert keys and split nodes properly', () => {
    const tree = new BTree(2); // t=2 -> max 3 keys per node

    tree.insert(10, 'ten');
    tree.insert(20, 'twenty');
    tree.insert(30, 'thirty'); // triggers split of root node
    tree.insert(40, 'forty');
    tree.insert(50, 'fifty');

    expect(tree.search(10)).toBe('ten');
    expect(tree.search(20)).toBe('twenty');
    expect(tree.search(30)).toBe('thirty');
    expect(tree.search(40)).toBe('forty');
    expect(tree.search(50)).toBe('fifty');
    expect(tree.search(60)).toBe(undefined);

    // Root should have split and contains the middle key (20 or 30 depending on split logic)
    expect(tree.root.keys.length).toBe(1);
    expect(tree.root.children.length).toBe(2);
  });
});
