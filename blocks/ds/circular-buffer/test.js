import { describe, it, expect } from '../../../test/test-harness.js';
import {CircularBuffer} from './index.js';

  await describe('ds/circular-buffer', async () => {
    await it('should handle fixed-size ring queueing correctly', async () => {
      const cb = new CircularBuffer(3);
      cb.push(1);
      cb.push(2);
      cb.push(3);
      cb.push(4); // Overwrites 1
      expect(cb.toArray()).toEqual([2, 3, 4]);
      expect(cb.poll()).toBe(2);
    });
  });
