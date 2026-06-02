import { describe, it, expect } from '../../../test/test-harness.js';
import {AVLTree} from './index.js';

  await describe('ds/avl-tree', async () => {
    await it('should self-balance when keys are inserted in sorted order', () => {
      const tree = new AVLTree();
      tree.insert(10, 'A');
      tree.insert(20, 'B');
      tree.insert(30, 'C'); // triggers left rotation
      expect(tree.root.key).toBe(20);
      expect(tree.root.left.key).toBe(10);
      expect(tree.root.right.key).toBe(30);
    });

    await it('should find and delete nodes correctly', () => {
      const tree = new AVLTree();
      tree.insert(15, 'XV');
      tree.insert(10, 'X');
      tree.insert(20, 'XX');
      expect(tree.find(10)).toBe('X');
      tree.delete(10);
      expect(tree.find(10)).toBe(undefined);
      expect(tree.inOrder()).toEqual([
        { key: 15, value: 'XV' },
        { key: 20, value: 'XX' }
      ]);
    });
  });
