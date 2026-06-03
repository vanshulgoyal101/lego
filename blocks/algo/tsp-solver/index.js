export class TSPSolver {
  /**
   * Solves the Traveling Salesperson Problem (TSP) exactly using backtracking.
   * @param {number[][]} matrix - 2D adjacency matrix representing pairwise distances
   * @param {number} [start=0] - The index of the starting city
   * @returns {Object} { minCost: number, tour: number[] }
   */
  static solve(matrix, start = 0) {
    const n = matrix.length;
    if (n === 0) {
      return { minCost: 0, tour: [] };
    }
    if (n === 1) {
      return { minCost: 0, tour: [start, start] };
    }

    const visited = new Set();
    visited.add(start);

    let bestCost = Infinity;
    let bestTour = [];

    const backtrack = (curr, cost, path) => {
      // Base case: all cities visited
      if (path.length === n) {
        const returnCost = matrix[curr][start];
        if (returnCost !== undefined && returnCost !== Infinity) {
          const totalCost = cost + returnCost;
          if (totalCost < bestCost) {
            bestCost = totalCost;
            bestTour = [...path, start];
          }
        }
        return;
      }

      for (let next = 0; next < n; next++) {
        if (!visited.has(next)) {
          const edgeCost = matrix[curr][next];
          if (edgeCost !== undefined && edgeCost !== Infinity) {
            // Prune search if current cost exceeds best cost
            if (cost + edgeCost < bestCost) {
              visited.add(next);
              path.push(next);
              
              backtrack(next, cost + edgeCost, path);
              
              path.pop();
              visited.delete(next);
            }
          }
        }
      }
    };

    backtrack(start, 0, [start]);

    return { minCost: bestCost, tour: bestTour };
  }
}
