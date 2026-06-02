import { describe, it, expect } from '../../../test/test-harness.js';
import { dijkstra, reconstructPath } from './index.js';

await describe('algo/dijkstra', async () => {
  await it('should compute correct shortest distances', () => {
    const graph = {
      A: [{ node: 'B', weight: 1 }, { node: 'C', weight: 4 }],
      B: [{ node: 'C', weight: 2 }, { node: 'D', weight: 5 }],
      C: [{ node: 'D', weight: 1 }],
      D: [],
    };
    const { distances } = dijkstra(graph, 'A');
    expect(distances['A']).toBe(0);
    expect(distances['B']).toBe(1);
    expect(distances['C']).toBe(3);
    expect(distances['D']).toBe(4);
  });

  await it('should reconstruct the shortest path', () => {
    const graph = {
      A: [{ node: 'B', weight: 1 }, { node: 'C', weight: 4 }],
      B: [{ node: 'C', weight: 2 }, { node: 'D', weight: 5 }],
      C: [{ node: 'D', weight: 1 }],
      D: [],
    };
    const { predecessors } = dijkstra(graph, 'A');
    const path = reconstructPath(predecessors, 'A', 'D');
    expect(path).toEqual(['A', 'B', 'C', 'D']);
  });

  await it('should assign Infinity to unreachable nodes', () => {
    const graph = {
      A: [],
      B: [],
    };
    const { distances } = dijkstra(graph, 'A');
    expect(distances['B']).toBe(Infinity);
  });

  await it('should handle source = destination', () => {
    const graph = { X: [{ node: 'Y', weight: 5 }], Y: [] };
    const { distances } = dijkstra(graph, 'X');
    expect(distances['X']).toBe(0);
  });

  await it('should handle a graph with a single node', () => {
    const graph = { solo: [] };
    const { distances } = dijkstra(graph, 'solo');
    expect(distances['solo']).toBe(0);
  });

  await it('should return null path for unreachable target', () => {
    const graph = { A: [], B: [] };
    const { predecessors } = dijkstra(graph, 'A');
    const path = reconstructPath(predecessors, 'A', 'B');
    expect(path).toBe(null);
  });

  await it('should handle nodes referenced as neighbours but not as keys', () => {
    const graph = {
      A: [{ node: 'B', weight: 2 }],
    };
    const { distances } = dijkstra(graph, 'A');
    expect(distances['B']).toBe(2);
  });
});
