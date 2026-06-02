import { describe, it, expect } from '../../../test/test-harness.js';
import { kruskalMst } from './index.js';

await describe('algo/kruskal-mst', async () => {
  await it('should compute the correct minimum spanning tree', () => {
    const vertices = ['A', 'B', 'C', 'D', 'E', 'F'];
    const edges = [
      { u: 'A', v: 'B', weight: 4 },
      { u: 'A', v: 'C', weight: 3 },
      { u: 'B', v: 'C', weight: 1 },
      { u: 'B', v: 'D', weight: 2 },
      { u: 'C', v: 'D', weight: 4 },
      { u: 'C', v: 'E', weight: 4 },
      { u: 'D', v: 'E', weight: 3 },
      { u: 'D', v: 'F', weight: 1 },
      { u: 'E', v: 'F', weight: 5 }
    ];

    const { totalWeight, mstEdges } = kruskalMst(vertices, edges);

    expect(totalWeight).toBe(10);
    expect(mstEdges.length).toBe(5);
  });
});
