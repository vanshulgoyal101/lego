import { describe, it, expect } from '../../../test/test-harness.js';
import {kmeans} from './index.js';

  await describe('algo/kmeans', async () => {
    await it('should cluster points correctly', () => {
      const data = [
        [1, 1], [1, 2], [2, 1],
        [20, 20], [21, 20], [20, 21]
      ];
      const res = kmeans(data, 2);
      expect(res.assignments[0]).toBe(res.assignments[1]);
      expect(res.assignments[3]).toBe(res.assignments[4]);
      if (res.assignments[0] === res.assignments[3]) {
        throw new Error('Points should belong to different clusters');
      }
    });
  });
