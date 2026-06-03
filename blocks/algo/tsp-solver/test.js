import { describe, it, expect } from '../../../test/test-harness.js';
import { TSPSolver } from './index.js';

await describe('algo/tsp-solver', async () => {
  await it('should find the optimal tour on a small graph', () => {
    // 4 cities distance matrix
    const matrix = [
      [0, 10, 15, 20],
      [10, 0, 35, 25],
      [15, 35, 0, 30],
      [20, 25, 30, 0]
    ];

    const { minCost, tour } = TSPSolver.solve(matrix, 0);

    // Paths checking:
    // 0 -> 1 -> 3 -> 2 -> 0: cost 10 + 25 + 30 + 15 = 80
    // 0 -> 2 -> 3 -> 1 -> 0: cost 15 + 30 + 25 + 10 = 80
    expect(minCost).toBe(80);
    expect(tour.length).toBe(5);
    expect(tour[0]).toBe(0);
    expect(tour[4]).toBe(0);
  });
});
