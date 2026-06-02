/**
 * Topological Sort for Directed Acyclic Graphs (DAGs)
 * Implements Kahn's BFS algorithm (in-degree based) and DFS-based sort.
 * Detects cycles and throws with cycle information.
 */

/**
 * Perform topological sort using Kahn's BFS algorithm.
 * @param {Map<any, Set<any>>} graph - Adjacency map: node -> Set of dependencies.
 * @returns {Array<any>} Topologically sorted node order (dependencies first).
 * @throws {Error} If a cycle is detected.
 */
export function topologicalSort(graph) {
  // Compute in-degree for all nodes
  const inDegree = new Map();
  const adjList = new Map(); // node -> nodes that depend on it (reverse edges for output)

  // Ensure all nodes are tracked
  for (const [node] of graph.entries()) {
    if (!inDegree.has(node)) inDegree.set(node, 0);
    if (!adjList.has(node)) adjList.set(node, []);
  }

  // Fill in-degrees and reverse edges
  for (const [node, deps] of graph.entries()) {
    for (const dep of deps) {
      if (!inDegree.has(dep)) inDegree.set(dep, 0);
      if (!adjList.has(dep)) adjList.set(dep, []);
      adjList.get(dep).push(node);
      inDegree.set(node, (inDegree.get(node) || 0) + 1);
    }
  }

  // Wait — recalculate: inDegree of a node = number of deps it has
  // Reset and recalculate properly
  const inDeg = new Map();
  const neighbors = new Map(); // dep -> [nodes that need it]

  for (const [node, deps] of graph.entries()) {
    if (!inDeg.has(node)) inDeg.set(node, 0);
    for (const dep of deps) {
      if (!inDeg.has(dep)) inDeg.set(dep, 0);
      if (!neighbors.has(dep)) neighbors.set(dep, []);
      neighbors.get(dep).push(node);
      inDeg.set(node, (inDeg.get(node) || 0) + 1);
    }
  }

  // Queue nodes with in-degree 0 (no dependencies)
  const queue = [];
  for (const [node, deg] of inDeg.entries()) {
    if (deg === 0) queue.push(node);
  }

  const result = [];
  while (queue.length > 0) {
    const node = queue.shift();
    result.push(node);

    for (const dependent of (neighbors.get(node) || [])) {
      inDeg.set(dependent, inDeg.get(dependent) - 1);
      if (inDeg.get(dependent) === 0) {
        queue.push(dependent);
      }
    }
  }

  if (result.length !== inDeg.size) {
    // Find cycle participants
    const cycleNodes = [...inDeg.entries()]
      .filter(([, deg]) => deg > 0)
      .map(([n]) => n);
    throw new Error(`Cycle detected in graph involving nodes: ${cycleNodes.join(', ')}`);
  }

  return result;
}

/**
 * Topological sort using DFS-based approach (returns reverse post-order).
 * @param {Map<any, Set<any>>} graph - Adjacency map: node -> Set of dependencies.
 * @returns {Array<any>} Sorted order.
 * @throws {Error} If a cycle is detected.
 */
export function topologicalSortDFS(graph) {
  const visited = new Set();
  const visiting = new Set(); // Nodes currently on the DFS path
  const result = [];

  function dfs(node) {
    if (visiting.has(node)) {
      throw new Error(`Cycle detected involving node: ${String(node)}`);
    }
    if (visited.has(node)) return;

    visiting.add(node);

    const deps = graph.get(node) || new Set();
    for (const dep of deps) {
      dfs(dep);
    }

    visiting.delete(node);
    visited.add(node);
    result.push(node); // Post-order: dependencies come first naturally
  }

  for (const node of graph.keys()) {
    if (!visited.has(node)) dfs(node);
  }

  return result;
}

/**
 * Convenience: build a graph from an array of [node, dependencies[]] pairs.
 * @param {Array<[any, any[]]>} entries
 * @returns {Map<any, Set<any>>}
 */
export function buildGraph(entries) {
  const graph = new Map();
  for (const [node, deps] of entries) {
    graph.set(node, new Set(deps));
  }
  return graph;
}
