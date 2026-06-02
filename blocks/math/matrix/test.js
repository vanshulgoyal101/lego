import { describe, it, expect } from '../../../test/test-harness.js';
import {Matrix} from './index.js';

  await describe('math/matrix', async () => {
    await it('should calculate determinant and multiply matrices', async () => {
      const m1 = new Matrix([[1, 2], [3, 4]]);
      const m2 = new Matrix([[2, 0], [1, 2]]);
      expect(m1.determinant()).toBe(-2);
      expect(m1.multiply(m2)).toEqual(new Matrix([[4, 4], [10, 8]]));
    });
  });
