/**
 * Floyd-Warshall All-Pairs Shortest Path Algorithm
 *
 * @param {Object} graph - Adjacency list representation: { node: [{ node, weight }] }
 * @returns {Object} { distances, next } - matrix values and reconstruction helpers
 */
export function floydWarshall(graph) {
  const vertices = Object.keys(graph);
  const dist = {};
  const next = {};

  // Initialize matrices
  for (const u of vertices) {
    dist[u] = {};
    next[u] = {};
    for (const v of vertices) {
      if (u === v) {
        dist[u][v] = 0;
      } else {
        dist[u][v] = Infinity;
      }
      next[u][v] = null;
    }
  }

  // Populate values from initial edges
  for (const u of vertices) {
    for (const edge of graph[u] || []) {
      const v = edge.node;
      dist[u][v] = edge.weight;
      next[u][v] = v;
    }
  }

  // Triple nested iterations
  for (const k of vertices) {
    for (const i of vertices) {
      for (const j of vertices) {
        if (dist[i][k] !== Infinity && dist[k][j] !== Infinity) {
          if (dist[i][k] + dist[k][j] < dist[i][j]) {
            dist[i][j] = dist[i][k] + dist[k][j];
            next[i][j] = next[i][k];
          }
        }
      }
    }
  }

  // Check for negative self-loops (indicates negative cycles)
  let hasNegativeCycle = false;
  for (const v of vertices) {
    if (dist[v][v] < 0) {
      hasNegativeCycle = true;
      break;
    }
  }

  /**
   * Reconstruct path from start to end node
   */
  const getPath = (start, end) => {
    if (dist[start][end] === Infinity) return null;
    const path = [start];
    let curr = start;
    while (curr !== end) {
      curr = next[curr][end];
      if (curr === null) return null;
      path.push(curr);
    }
    return path;
  };

  return {
    distances: dist,
    next,
    hasNegativeCycle,
    getPath
  };
}
