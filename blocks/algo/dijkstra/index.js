/**
 * @module algo/dijkstra
 *
 * Dijkstra's single-source shortest path algorithm on a weighted graph.
 *
 * Uses a binary min-heap (priority queue) for O((V + E) log V) time.
 * Works on directed or undirected graphs represented as adjacency lists.
 * All edge weights must be non-negative.
 *
 * Graph format:
 *   { nodeId: [ { node: neighbourId, weight: number }, ... ] }
 *
 * Nodes that appear as neighbours but are absent as keys are still processed.
 */

/**
 * @typedef {Object} Edge
 * @property {string|number} node   - Destination node identifier.
 * @property {number}        weight - Non-negative edge weight.
 */

/**
 * @typedef {Object<string|number, Edge[]>} Graph
 */

/**
 * @typedef {Object} DijkstraResult
 * @property {Object<string|number, number>}          distances    - Shortest distance from source to each node.
 * @property {Object<string|number, string|number|null>} predecessors - Previous node on the shortest path tree.
 */

/** @private */
class PriorityQueue {
  constructor() {
    this._heap = [];
  }

  push(dist, node) {
    this._heap.push({ dist, node });
    this._bubbleUp(this._heap.length - 1);
  }

  pop() {
    const top = this._heap[0];
    const last = this._heap.pop();
    if (this._heap.length > 0) {
      this._heap[0] = last;
      this._siftDown(0);
    }
    return top;
  }

  get isEmpty() { return this._heap.length === 0; }

  _bubbleUp(i) {
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (this._heap[p].dist <= this._heap[i].dist) break;
      [this._heap[p], this._heap[i]] = [this._heap[i], this._heap[p]];
      i = p;
    }
  }

  _siftDown(i) {
    const n = this._heap.length;
    while (true) {
      let min = i;
      const l = 2 * i + 1, r = 2 * i + 2;
      if (l < n && this._heap[l].dist < this._heap[min].dist) min = l;
      if (r < n && this._heap[r].dist < this._heap[min].dist) min = r;
      if (min === i) break;
      [this._heap[min], this._heap[i]] = [this._heap[i], this._heap[min]];
      i = min;
    }
  }
}

/**
 * Runs Dijkstra's algorithm from a source node on a weighted adjacency-list graph.
 *
 * @param {Graph}         graph  - Adjacency list. Each key maps to an array of {node, weight}.
 * @param {string|number} source - The starting node.
 * @returns {DijkstraResult} Object containing `distances` and `predecessors` maps.
 *
 * @example
 * const graph = {
 *   A: [{ node: 'B', weight: 1 }, { node: 'C', weight: 4 }],
 *   B: [{ node: 'C', weight: 2 }, { node: 'D', weight: 5 }],
 *   C: [{ node: 'D', weight: 1 }],
 *   D: [],
 * };
 * const { distances, predecessors } = dijkstra(graph, 'A');
 * // distances: { A: 0, B: 1, C: 3, D: 4 }
 * // predecessors: { A: null, B: 'A', C: 'B', D: 'C' }
 */
export function dijkstra(graph, source) {
  const distances = {};
  const predecessors = {};
  const visited = new Set();
  const pq = new PriorityQueue();

  // Collect all nodes (keys + any neighbours not listed as keys)
  const allNodes = new Set(Object.keys(graph));
  for (const edges of Object.values(graph)) {
    for (const { node } of edges) allNodes.add(String(node));
  }

  for (const node of allNodes) {
    distances[node] = Infinity;
    predecessors[node] = null;
  }

  const srcKey = String(source);
  distances[srcKey] = 0;
  pq.push(0, srcKey);

  while (!pq.isEmpty) {
    const { dist, node } = pq.pop();

    if (visited.has(node)) continue;
    visited.add(node);

    if (dist > distances[node]) continue; // stale entry

    const neighbours = graph[node] || [];
    for (const { node: neighbour, weight } of neighbours) {
      if (weight < 0) throw new Error(`Negative edge weight detected: ${node} -> ${neighbour}`);
      const nKey = String(neighbour);
      const newDist = distances[node] + weight;
      if (newDist < distances[nKey]) {
        distances[nKey] = newDist;
        predecessors[nKey] = node;
        pq.push(newDist, nKey);
      }
    }
  }

  return { distances, predecessors };
}

/**
 * Reconstructs the shortest path from source to target using the predecessors map.
 *
 * @param {Object<string, string|null>} predecessors - From a dijkstra() call.
 * @param {string|number} source - Source node.
 * @param {string|number} target - Target node.
 * @returns {string[]|null} Ordered array of node ids from source to target, or null if unreachable.
 *
 * @example
 * const { predecessors } = dijkstra(graph, 'A');
 * reconstructPath(predecessors, 'A', 'D'); // ['A', 'B', 'C', 'D']
 */
export function reconstructPath(predecessors, source, target) {
  const path = [];
  let current = String(target);
  const srcKey = String(source);

  while (current !== null && current !== undefined) {
    path.push(current);
    if (current === srcKey) break;
    current = predecessors[current];
  }

  if (path[path.length - 1] !== srcKey) return null; // Unreachable
  return path.reverse();
}
