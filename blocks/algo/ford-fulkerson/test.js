import { describe, it, expect } from '../../../test/test-harness.js';
import { FordFulkerson } from './index.js';

await describe('algo/ford-fulkerson', async () => {
  await it('should compute the correct max flow on a simple network', () => {
    const graph = {
      S: { A: 10, B: 10 },
      A: { C: 4, D: 8 },
      B: { C: 9, D: 0 }, // edge with 0 capacity
      C: { T: 10 },
      D: { T: 10 }
    };

    const { maxFlow } = FordFulkerson.compute(graph, 'S', 'T');
    expect(maxFlow).toBe(18);
  });

  await it('should compute max flow on classic graph', () => {
    const graph = {
      S: { A: 16, B: 13 },
      A: { B: 10, C: 12 },
      B: { A: 4, D: 14 },
      C: { B: 9, T: 20 },
      D: { C: 7, T: 4 }
    };
    const { maxFlow } = FordFulkerson.compute(graph, 'S', 'T');
    expect(maxFlow).toBe(23);
  });
});
