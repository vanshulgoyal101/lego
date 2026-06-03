import { describe, it, expect } from '../../../test/test-harness.js';
import { SplayTree } from './index.js';

await describe('ds/splay-tree', async () => {
  await it('should insert keys and splay recently accessed to root', () => {
    const tree = new SplayTree();

    tree.insert(10, 'ten');
    tree.insert(5, 'five');
    tree.insert(20, 'twenty');

    // Recently inserted/accessed should be root
    expect(tree.root.key).toBe(20);

    const val = tree.find(5);
    expect(val).toBe('five');
    
    // Splay operation must bring 5 to the root
    expect(tree.root.key).toBe(5);

    const ordered = tree.inorder();
    expect(ordered.length).toBe(3);
    expect(ordered[0].key).toBe(5);
    expect(ordered[1].key).toBe(10);
    expect(ordered[2].key).toBe(20);
  });
});
