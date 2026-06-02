/**
 * A standard directed/undirected Graph implementation.
 * Supports node insertions, edge additions, breadth-first search (BFS),
 * depth-first search (DFS), and Dijkstra's shortest pathfinding algorithm.
 */
export class Graph {
  /**
   * @param {boolean} [directed=false] - If true, edges are unidirectional.
   */
  constructor(directed = false) {
    this.directed = directed;
    this.adjacencyList = new Map();
  }

  /**
   * Add a node to the graph.
   * @param {string|number} vertex
   */
  addVertex(vertex) {
    if (!this.adjacencyList.has(vertex)) {
      this.adjacencyList.set(vertex, []);
    }
  }

  /**
   * Add an edge between two vertices.
   * @param {string|number} v1
   * @param {string|number} v2
   * @param {number} [weight=1] - Weight of the connection edge.
   */
  addEdge(v1, v2, weight = 1) {
    this.addVertex(v1);
    this.addVertex(v2);

    this.adjacencyList.get(v1).push({ node: v2, weight });
    if (!this.directed) {
      this.adjacencyList.get(v2).push({ node: v1, weight });
    }
  }

  /**
   * Depth First Search (DFS) traversal.
   * @param {string|number} startVertex
   * @returns {Array} List of visited vertices in order.
   */
  dfs(startVertex) {
    const visited = new Set();
    const result = [];
    
    const explore = (vertex) => {
      if (!vertex || visited.has(vertex)) return;
      visited.add(vertex);
      result.push(vertex);

      const neighbors = this.adjacencyList.get(vertex) || [];
      for (const neighbor of neighbors) {
        explore(neighbor.node);
      }
    };

    explore(startVertex);
    return result;
  }

  /**
   * Breadth First Search (BFS) traversal.
   * @param {string|number} startVertex
   * @returns {Array} List of visited vertices in order.
   */
  bfs(startVertex) {
    const visited = new Set();
    const result = [];
    const queue = [startVertex];

    visited.add(startVertex);

    while (queue.length > 0) {
      const vertex = queue.shift();
      result.push(vertex);

      const neighbors = this.adjacencyList.get(vertex) || [];
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor.node)) {
          visited.add(neighbor.node);
          queue.push(neighbor.node);
        }
      }
    }

    return result;
  }

  /**
   * Dijkstra's shortest pathfinding algorithm.
   * Find shortest path between start vertex and end vertex.
   * @param {string|number} start
   * @param {string|number} end
   * @returns {Object|null} { path: Array, distance: number } or null if unreachable.
   */
  dijkstra(start, end) {
    const distances = {};
    const previous = {};
    const queue = new Set();

    // Initialize distances
    for (const vertex of this.adjacencyList.keys()) {
      distances[vertex] = vertex === start ? 0 : Infinity;
      previous[vertex] = null;
      queue.add(vertex);
    }

    while (queue.size > 0) {
      // Find vertex in queue with min distance
      let minNode = null;
      for (const node of queue) {
        if (minNode === null || distances[node] < distances[minNode]) {
          minNode = node;
        }
      }

      if (minNode === null || distances[minNode] === Infinity) {
        break; // Remainder nodes are unreachable
      }

      if (minNode === end) {
        // Path found, rebuild it
        const path = [];
        let curr = end;
        while (curr !== null) {
          path.unshift(curr);
          curr = previous[curr];
        }
        return { path, distance: distances[end] };
      }

      queue.delete(minNode);

      const neighbors = this.adjacencyList.get(minNode) || [];
      for (const neighbor of neighbors) {
        if (!queue.has(neighbor.node)) continue;

        const alt = distances[minNode] + neighbor.weight;
        if (alt < distances[neighbor.node]) {
          distances[neighbor.node] = alt;
          previous[neighbor.node] = minNode;
        }
      }
    }

    return null; // Unreachable
  }
}
