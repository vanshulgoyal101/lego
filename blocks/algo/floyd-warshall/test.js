import { describe, it, expect } from '../../../test/test-harness.js';
import { floydWarshall } from './index.js';

await describe('algo/floyd-warshall', async () => {
  await it('should calculate all-pairs shortest paths correctly', () => {
    const graph = {
      1: [{ node: '3', weight: -2 }],
      2: [{ node: '1', weight: 4 }, { node: '3', weight: 3 }],
      3: [{ node: '4', weight: 2 }],
      4: [{ node: '2', weight: -1 }]
    };

    const { distances, getPath, hasNegativeCycle } = floydWarshall(graph);

    expect(hasNegativeCycle).toBe(false);
    expect(distances[1][4]).toBe(0); // 1 -> 3 -> 4 is -2 + 2 = 0
    expect(distances[2][1]).toBe(4); // Shortest path 2 -> 1 is 4
    expect(getPath('2', '3')).toEqual(['2', '1', '3']);
  });

  await it('should detect negative self-loops', () => {
    const graph = {
      1: [{ node: '2', weight: -1 }],
      2: [{ node: '3', weight: -2 }],
      3: [{ node: '1', weight: -1 }]
    };
    const { hasNegativeCycle } = floydWarshall(graph);
    expect(hasNegativeCycle).toBe(true);
  });
});
