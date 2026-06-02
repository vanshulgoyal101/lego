import { describe, it, expect } from '../../../test/test-harness.js';
import {promisePool} from './index.js';

  await describe('async/promise-pool', async () => {
    await it('should map values while maintaining concurrency limits and input order', async () => {
      const items = [10, 20, 30];
      const result = await promisePool(items, async (item) => {
        return item * 2;
      }, 2);
      expect(result).toEqual([20, 40, 60]);
    });
  });
