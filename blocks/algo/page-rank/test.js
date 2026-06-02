import { describe, it, expect } from '../../../test/test-harness.js';
import { pageRank } from './index.js';

await describe('algo/page-rank', async () => {
  await it('should distribute ranks proportionally based on backlinks structure', () => {
    // Simple 3-node linear graph: A -> B -> C
    const graph = {
      A: ['B'],
      B: ['C'],
      C: []
    };

    const ranks = pageRank(graph, 0.85, 50);

    // C has backlink from B, B from A. C should have highest rank, A lowest.
    expect(ranks.C > ranks.B).toBe(true);
    expect(ranks.B > ranks.A).toBe(true);

    // Sum of PageRanks must approximate 1.0
    const sum = Object.values(ranks).reduce((acc, r) => acc + r, 0);
    expect(Math.abs(sum - 1.0) < 1e-4).toBe(true);
  });
});
