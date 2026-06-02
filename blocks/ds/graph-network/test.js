import { describe, it, expect } from '../../../test/test-harness.js';
import {GraphNetwork} from './index.js';

  await describe('ds/graph-network', async () => {
    await it('should find shortest path using Dijkstra', () => {
      const g = new GraphNetwork();
      g.addEdge('A', 'B', 4);
      g.addEdge('A', 'C', 2);
      g.addEdge('C', 'B', 1);
      g.addEdge('B', 'D', 3);

      const result = g.dijkstra('A', 'D');
      expect(result.distance).toBe(6); // A->C->B->D = 2+1+3=6
      expect(result.path).toEqual(['A', 'C', 'B', 'D']);
    });

    await it('should return null for Dijkstra on unreachable node', () => {
      const g = new GraphNetwork();
      g.addEdge('A', 'B', 1);
      g.addNode('Z');
      const result = g.dijkstra('A', 'Z');
      expect(result).toBe(null);
    });

    await it('should compute MST using Kruskal', () => {
      const g = new GraphNetwork();
      g.addEdge('A', 'B', 4);
      g.addEdge('A', 'C', 2);
      g.addEdge('B', 'C', 1);
      g.addEdge('B', 'D', 3);

      const mst = g.kruskalMST();
      const totalWeight = mst.reduce((sum, e) => sum + e.weight, 0);
      expect(mst.length).toBe(3); // n-1 edges for n=4 nodes
      expect(totalWeight).toBe(6); // Minimum: B-C(1) + A-C(2) + B-D(3) = 6
    });

    await it('should find strongly connected components using Tarjan', () => {
      const g = new GraphNetwork();
      // SCC1: A->B->C->A (cycle), SCC2: D (standalone)
      g.addEdge('A', 'B', 1, true);
      g.addEdge('B', 'C', 1, true);
      g.addEdge('C', 'A', 1, true);
      g.addEdge('B', 'D', 1, true);

      const sccs = g.tarjanSCC();
      expect(sccs.length).toBe(2);
      // One SCC has 3 nodes, one has 1
      const sizes = sccs.map(scc => scc.length).sort((a,b) => a-b);
      expect(sizes).toEqual([1, 3]);
    });

    await it('should find path using A* search with Euclidean heuristic', () => {
      const g = new GraphNetwork();
      const coords = { A: [0,0], B: [1,0], C: [0,1], D: [1,1] };
      Object.keys(coords).forEach(n => g.addNode(n, coords[n]));
      g.addEdge('A', 'B', 1);
      g.addEdge('A', 'C', 1);
      g.addEdge('B', 'D', 1);
      g.addEdge('C', 'D', 2);

      const heuristic = (from, to) => {
        const [fx,fy] = coords[from];
        const [tx,ty] = coords[to];
        return Math.sqrt((fx-tx)**2 + (fy-ty)**2);
      };

      const result = g.astar('A', 'D', heuristic);
      expect(result.distance).toBe(2); // A->B->D cost=2
      expect(result.path).toEqual(['A', 'B', 'D']);
    });
  });
