import { describe, it, expect } from '../../../test/test-harness.js';
import { MinMaxHeap } from './index.js';

await describe('ds/min-max-heap', async () => {
  await it('should correctly maintain min and max properties and support extraction of both ends', () => {
    const heap = new MinMaxHeap();
    
    // Insert unsorted values
    const values = [50, 10, 90, 30, 70, 40, 80, 20, 60];
    for (const val of values) {
      heap.push(val);
    }

    expect(heap.size()).toBe(9);
    expect(heap.peekMin()).toBe(10);
    expect(heap.peekMax()).toBe(90);

    // Extract min elements
    expect(heap.popMin()).toBe(10);
    expect(heap.popMin()).toBe(20);
    expect(heap.size()).toBe(7);

    // Extract max elements
    expect(heap.popMax()).toBe(90);
    expect(heap.popMax()).toBe(80);
    expect(heap.size()).toBe(5);

    // Extract the rest in interleaved fashion
    expect(heap.popMin()).toBe(30);
    expect(heap.popMax()).toBe(70);
    expect(heap.popMin()).toBe(40);
    expect(heap.popMax()).toBe(60);
    expect(heap.popMin()).toBe(50);
    expect(heap.size()).toBe(0);
  });
});
