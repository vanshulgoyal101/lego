import { describe, it, expect } from '../../../test/test-harness.js';
import {KDTree} from './index.js';

  await describe('ds/kd-tree', async () => {
    await it('should correctly build and search nearest neighbor', () => {
      const points = [[2, 3], [5, 4], [9, 6], [4, 7], [8, 1], [7, 2]];
      const tree = new KDTree(points, 2);
      const nearest = tree.nearestNeighbor([9, 2]);
      // nearest point should be [7, 2] or [8, 1]
      expect(nearest).toEqual([8, 1]);
    });

    await it('should insert new points correctly', () => {
      const tree = new KDTree([[2, 3], [5, 4]], 2);
      tree.insert([9, 6]);
      const nearest = tree.nearestNeighbor([9, 5]);
      expect(nearest).toEqual([9, 6]);
    });
  });
