import { describe, it, expect } from '../../../test/test-harness.js';
import { bellmanFord } from './index.js';

await describe('algo/bellman-ford', async () => {
  await it('should calculate shortest paths correctly with positive and negative weights', () => {
    const graph = {
      A: [{ node: 'B', weight: -1 }, { node: 'C', weight: 4 }],
      B: [{ node: 'C', weight: 3 }, { node: 'D', weight: 2 }, { node: 'E', weight: 2 }],
      C: [],
      D: [{ node: 'B', weight: 1 }, { node: 'C', weight: 5 }],
      E: [{ node: 'D', weight: -3 }]
    };

    const { distances, predecessors, hasNegativeCycle } = bellmanFord(graph, 'A');

    expect(hasNegativeCycle).toBe(false);
    expect(distances.A).toBe(0);
    expect(distances.B).toBe(-1);
    expect(distances.C).toBe(2);
    expect(distances.D).toBe(-2);
    expect(distances.E).toBe(1);
    expect(predecessors.D).toBe('E');
  });

  await it('should detect negative cycles', () => {
    const graph = {
      A: [{ node: 'B', weight: 1 }],
      B: [{ node: 'C', weight: -1 }],
      C: [{ node: 'A', weight: -1 }] // negative cycle A -> B -> C -> A
    };

    const { hasNegativeCycle } = bellmanFord(graph, 'A');
    expect(hasNegativeCycle).toBe(true);
  });
});
