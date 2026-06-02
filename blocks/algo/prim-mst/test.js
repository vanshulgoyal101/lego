import { describe, it, expect } from '../../../test/test-harness.js';
import { primMst } from './index.js';

await describe('algo/prim-mst', async () => {
  await it('should compute the correct minimum spanning tree starting from A', () => {
    const graph = {
      A: [{ node: 'B', weight: 4 }, { node: 'C', weight: 3 }],
      B: [{ node: 'A', weight: 4 }, { node: 'C', weight: 1 }, { node: 'D', weight: 2 }],
      C: [{ node: 'A', weight: 3 }, { node: 'B', weight: 1 }, { node: 'D', weight: 4 }, { node: 'E', weight: 4 }],
      D: [{ node: 'B', weight: 2 }, { node: 'C', weight: 4 }, { node: 'E', weight: 3 }, { node: 'F', weight: 1 }],
      E: [{ node: 'C', weight: 4 }, { node: 'D', weight: 3 }, { node: 'F', weight: 5 }],
      F: [{ node: 'D', weight: 1 }, { node: 'E', weight: 5 }]
    };

    const { totalWeight, mstEdges } = primMst(graph, 'A');

    expect(totalWeight).toBe(10);
    expect(mstEdges.length).toBe(5);
  });
});
