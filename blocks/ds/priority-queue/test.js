import { describe, it, expect } from '../../../test/test-harness.js';
import {PriorityQueue} from './index.js';

  await describe('ds/priority-queue', async () => {
    await it('should handle sorting values by weight priority', async () => {
      const pq = new PriorityQueue();
      pq.enqueue(10);
      pq.enqueue(3);
      pq.enqueue(7);
      expect(pq.dequeue()).toBe(3);
      expect(pq.dequeue()).toBe(7);
      expect(pq.dequeue()).toBe(10);
    });
  });
