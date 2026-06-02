import { describe, it, expect } from '../../../test/test-harness.js';
import {topologicalSort, topologicalSortDFS, buildGraph} from './index.js';

  await describe('algo/topological-sort', async () => {
    await it('should sort simple dependency chain', () => {
      // A depends on B, B depends on C => order: C, B, A
      const graph = buildGraph([['A', ['B']], ['B', ['C']], ['C', []]]);
      const order = topologicalSort(graph);
      expect(order.indexOf('C')).toBeLessThan(order.indexOf('B'));
      expect(order.indexOf('B')).toBeLessThan(order.indexOf('A'));
    });

    await it('should handle multiple independent nodes', () => {
      const graph = buildGraph([['A', []], ['B', []], ['C', ['A', 'B']]]);
      const order = topologicalSort(graph);
      expect(order.indexOf('A')).toBeLessThan(order.indexOf('C'));
      expect(order.indexOf('B')).toBeLessThan(order.indexOf('C'));
    });

    await it('should detect cycles', () => {
      const graph = buildGraph([['A', ['B']], ['B', ['C']], ['C', ['A']]]); // Cycle!
      expect(() => topologicalSort(graph)).toThrow('Cycle');
    });

    await it('should sort using DFS approach', () => {
      const graph = buildGraph([['compile', ['lint']], ['lint', []], ['test', ['compile']]]);
      const order = topologicalSortDFS(graph);
      expect(order.indexOf('lint')).toBeLessThan(order.indexOf('compile'));
      expect(order.indexOf('compile')).toBeLessThan(order.indexOf('test'));
    });

    await it('should handle a single node', () => {
      const graph = buildGraph([['solo', []]]);
      const order = topologicalSort(graph);
      expect(order).toEqual(['solo']);
    });
  });
