import { describe, it, expect } from '../../../test/test-harness.js';
import {Vector2D} from './index.js';

  await describe('math/vector2d', async () => {
    await it('should perform vector mathematics correctly', async () => {
      const v1 = new Vector2D(3, 4);
      const v2 = new Vector2D(1, 2);
      expect(v1.magnitude()).toBe(5);
      expect(v1.add(v2)).toEqual(new Vector2D(4, 6));
      expect(v1.dot(v2)).toBe(11);
    });
  });
