/**
 * Prim's Minimum Spanning Tree Algorithm
 *
 * @param {Object} graph - Adjacency list representation: { node: [{ node, weight }] }
 * @param {string} [startNode] - Start vertex Node ID
 * @returns {Object} { mstEdges, totalWeight }
 */
export function primMst(graph, startNode) {
  const vertices = Object.keys(graph);
  if (vertices.length === 0) return { mstEdges: [], totalWeight: 0 };

  const start = startNode || vertices[0];
  const visited = new Set();
  const mstEdges = [];
  let totalWeight = 0;

  visited.add(start);

  // A basic array min-heap simulation for ease of implementation
  // since we keep it zero-dependency.
  const candidateEdges = [];

  function addEdges(node) {
    const neighbors = graph[node] || [];
    for (const edge of neighbors) {
      if (!visited.has(edge.node)) {
        candidateEdges.push({ u: node, v: edge.node, weight: edge.weight });
      }
    }
    candidateEdges.sort((a, b) => a.weight - b.weight); // sort to simulate min-priority queue
  }

  addEdges(start);

  while (visited.size < vertices.length && candidateEdges.length > 0) {
    const minEdge = candidateEdges.shift();
    if (visited.has(minEdge.v)) continue;

    visited.add(minEdge.v);
    mstEdges.push(minEdge);
    totalWeight += minEdge.weight;

    addEdges(minEdge.v);
  }

  return { mstEdges, totalWeight };
}
