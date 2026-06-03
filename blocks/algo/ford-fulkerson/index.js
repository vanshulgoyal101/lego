export class FordFulkerson {
  /**
   * Computes the maximum flow from source to sink in a directed graph.
   * @param {Object} graph - Graph representation where graph[u][v] is the capacity from u to v.
   *                         Example: { A: { B: 10, C: 10 }, B: { C: 2, D: 10 }, ... }
   * @param {string|number} source - Source node
   * @param {string|number} sink - Sink node
   * @returns {Object} An object containing { maxFlow, flow }
   */
  static compute(graph, source, sink) {
    const nodes = new Set();
    for (const u of Object.keys(graph)) {
      nodes.add(u);
      for (const v of Object.keys(graph[u])) {
        nodes.add(v);
      }
    }

    const nodeList = Array.from(nodes);
    const n = nodeList.length;
    const nodeToIndex = {};
    nodeList.forEach((node, i) => {
      nodeToIndex[node] = i;
    });

    // Residual capacities grid
    const residual = Array.from({ length: n }, () => Array(n).fill(0));
    // Original capacities grid to reconstruct flow
    const original = Array.from({ length: n }, () => Array(n).fill(0));

    for (const u of Object.keys(graph)) {
      const uIdx = nodeToIndex[u];
      for (const v of Object.keys(graph[u])) {
        const vIdx = nodeToIndex[v];
        const capacity = graph[u][v];
        residual[uIdx][vIdx] = capacity;
        original[uIdx][vIdx] = capacity;
      }
    }

    const sIdx = nodeToIndex[source];
    const tIdx = nodeToIndex[sink];

    if (sIdx === undefined || tIdx === undefined) {
      throw new Error('Source or sink node not found in graph');
    }

    let maxFlow = 0;
    const parent = Array(n);

    // BFS to find augmenting path
    const bfs = () => {
      parent.fill(-1);
      const queue = [sIdx];
      parent[sIdx] = -2;

      while (queue.length > 0) {
        const curr = queue.shift();
        for (let next = 0; next < n; next++) {
          if (parent[next] === -1 && residual[curr][next] > 0) {
            parent[next] = curr;
            if (next === tIdx) {
              return true;
            }
            queue.push(next);
          }
        }
      }
      return false;
    };

    while (bfs()) {
      // Find bottleneck capacity
      let pathFlow = Infinity;
      let curr = tIdx;
      while (curr !== sIdx) {
        const prev = parent[curr];
        pathFlow = Math.min(pathFlow, residual[prev][curr]);
        curr = prev;
      }

      // Update residual capacities
      curr = tIdx;
      while (curr !== sIdx) {
        const prev = parent[curr];
        residual[prev][curr] -= pathFlow;
        residual[curr][prev] += pathFlow;
        curr = prev;
      }

      maxFlow += pathFlow;
    }

    // Reconstruct flow details
    const flowResult = {};
    for (let i = 0; i < n; i++) {
      const u = nodeList[i];
      for (let j = 0; j < n; j++) {
        const v = nodeList[j];
        if (original[i][j] > 0) {
          // Flow is original capacity minus residual capacity
          const flow = original[i][j] - residual[i][j];
          if (flow > 0) {
            if (!flowResult[u]) {
              flowResult[u] = {};
            }
            flowResult[u][v] = flow;
          }
        }
      }
    }

    return { maxFlow, flow: flowResult };
  }
}
