/**
 * Bellman-Ford Shortest Path Algorithm
 * Calculates single-source shortest paths in a weighted graph.
 * Handles negative weights and detects negative cycles.
 *
 * @param {Object} graph - Adjacency list representation: { node: [{ node, weight }] }
 * @param {string} source - Starting vertex node key
 * @returns {Object} { distances, predecessors, hasNegativeCycle }
 */
export function bellmanFord(graph, source) {
  const vertices = Object.keys(graph);
  const distances = {};
  const predecessors = {};

  // Initialize distances
  for (const v of vertices) {
    distances[v] = Infinity;
    predecessors[v] = null;
  }
  distances[source] = 0;

  // Gather all edges
  const edges = [];
  for (const u of vertices) {
    for (const edge of graph[u] || []) {
      edges.push({ from: u, to: edge.node, weight: edge.weight });
    }
  }

  // Relax edges |V| - 1 times
  const vCount = vertices.length;
  for (let i = 0; i < vCount - 1; i++) {
    let relaxedAny = false;
    for (const { from, to, weight } of edges) {
      if (distances[from] !== Infinity && distances[from] + weight < distances[to]) {
        distances[to] = distances[from] + weight;
        predecessors[to] = from;
        relaxedAny = true;
      }
    }
    if (!relaxedAny) break; // Optimization: early stop if no relaxation occurs
  }

  // Check for negative-weight cycles
  let hasNegativeCycle = false;
  for (const { from, to, weight } of edges) {
    if (distances[from] !== Infinity && distances[from] + weight < distances[to]) {
      hasNegativeCycle = true;
      break;
    }
  }

  return {
    distances,
    predecessors,
    hasNegativeCycle
  };
}
