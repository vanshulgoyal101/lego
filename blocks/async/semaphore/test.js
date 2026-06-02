import { describe, it, expect } from '../../../test/test-harness.js';
import {Semaphore} from './index.js';

  await describe('async/semaphore', async () => {
    await it('should limit concurrency slots', async () => {
      const sem = new Semaphore(2);
      let count = 0;
      let maxActive = 0;
      const task = async () => {
        count++;
        if (count > maxActive) maxActive = count;
        await new Promise(resolve => setTimeout(resolve, 5));
        count--;
      };
      await Promise.all([sem.run(task), sem.run(task), sem.run(task)]);
      expect(maxActive).toBe(2);
    });
  });
