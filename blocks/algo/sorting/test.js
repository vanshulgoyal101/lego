import { describe, it, expect } from '../../../test/test-harness.js';
import {quickSort, mergeSort} from './index.js';

  await describe('algo/sorting', async () => {
    await it('should sort arrays using QuickSort and MergeSort', async () => {
      const arr1 = [5, 2, 8, 1, 9];
      const sorted1 = quickSort(arr1);
      expect(sorted1).toEqual([1, 2, 5, 8, 9]);

      const arr2 = [10, -1, 3, 2];
      const sorted2 = mergeSort(arr2);
      expect(sorted2).toEqual([-1, 2, 3, 10]);
    });
  });
