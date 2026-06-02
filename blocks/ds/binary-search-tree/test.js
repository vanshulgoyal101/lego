import { describe, it, expect } from '../../../test/test-harness.js';
import {BinarySearchTree} from './index.js';

  await describe('ds/binary-search-tree', async () => {
    await it('should insert, find, delete and traverse values', async () => {
      const bst = new BinarySearchTree();
      bst.insert(15);
      bst.insert(10);
      bst.insert(20);
      expect(bst.find(10)).toBe(true);
      expect(bst.find(30)).toBe(false);
      
      bst.delete(10);
      expect(bst.find(10)).toBe(false);
      expect(bst.traverseInOrder()).toEqual([15, 20]);
    });
  });
