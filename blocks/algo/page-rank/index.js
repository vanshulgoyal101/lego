/**
 * PageRank Algorithm
 * Calculates probability distribution scores representing the relative importance of graph nodes.
 *
 * @param {Object} graph - Directed adjacency list: { node: [outboundNodes] }
 * @param {number} [dampingFactor=0.85] - Damping factor (d)
 * @param {number} [maxIterations=100] - Max iterations
 * @param {number} [tolerance=1e-6] - Convergence threshold
 * @returns {Object} Mapping of node keys to their numeric PageRank values
 */
export function pageRank(graph, dampingFactor = 0.85, maxIterations = 100, tolerance = 1e-6) {
  const nodes = Object.keys(graph);
  const n = nodes.length;
  if (n === 0) return {};

  let ranks = {};
  // Initialize uniform distribution ranks
  for (const node of nodes) {
    ranks[node] = 1 / n;
  }

  // Pre-calculate out-degrees and inbound node mappings
  const outDegrees = {};
  const inbound = {};
  for (const node of nodes) {
    outDegrees[node] = (graph[node] || []).length;
    inbound[node] = [];
  }

  for (const u of nodes) {
    const targets = graph[u] || [];
    for (const v of targets) {
      if (inbound[v]) {
        inbound[v].push(u);
      }
    }
  }

  const base = (1 - dampingFactor) / n;

  for (let iter = 0; iter < maxIterations; iter++) {
    const newRanks = {};
    let danglingSum = 0;

    // Track sum of ranks from dangling nodes (nodes with 0 out-degree)
    for (const node of nodes) {
      if (outDegrees[node] === 0) {
        danglingSum += ranks[node];
      }
    }

    const danglingTerm = dampingFactor * (danglingSum / n);

    for (const node of nodes) {
      let sum = 0;
      for (const parent of inbound[node] || []) {
        sum += ranks[parent] / outDegrees[parent];
      }
      newRanks[node] = base + danglingTerm + dampingFactor * sum;
    }

    // Check convergence
    let diff = 0;
    for (const node of nodes) {
      diff += Math.abs(newRanks[node] - ranks[node]);
    }

    ranks = newRanks;
    if (diff < tolerance) {
      break;
    }
  }

  return ranks;
}
