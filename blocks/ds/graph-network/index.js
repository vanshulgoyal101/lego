/**
 * Advanced Graph Network Data Structure
 * Pure JS implementation supporting Dijkstra, A*, Kruskal's MST, and Tarjan's SCC.
 * Self-contained with inline min-heap / priority queue and disjoint set union.
 */

// Minimal Priority Queue for Dijkstra and A*
class MinHeap {
  constructor() {
    this.heap = [];
  }
  
  push(element, priority) {
    this.heap.push({ element, priority });
    this._bubbleUp(this.heap.length - 1);
  }
  
  pop() {
    if (this.isEmpty()) return null;
    const top = this.heap[0];
    const bottom = this.heap.pop();
    if (this.heap.length > 0) {
      this.heap[0] = bottom;
      this._bubbleDown(0);
    }
    return top.element;
  }
  
  isEmpty() {
    return this.heap.length === 0;
  }
  
  _bubbleUp(index) {
    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2);
      if (this.heap[index].priority >= this.heap[parentIndex].priority) break;
      this._swap(index, parentIndex);
      index = parentIndex;
    }
  }
  
  _bubbleDown(index) {
    const length = this.heap.length;
    while (2 * index + 1 < length) {
      let left = 2 * index + 1;
      let right = left + 1;
      let smallest = left;
      
      if (right < length && this.heap[right].priority < this.heap[left].priority) {
        smallest = right;
      }
      
      if (this.heap[index].priority <= this.heap[smallest].priority) break;
      this._swap(index, smallest);
      index = smallest;
    }
  }
  
  _swap(i, j) {
    const temp = this.heap[i];
    this.heap[i] = this.heap[j];
    this.heap[j] = temp;
  }
}

// Disjoint Set Union (DSU) for Kruskal's MST
class DisjointSet {
  constructor() {
    this.parent = new Map();
    this.rank = new Map();
  }
  
  makeSet(x) {
    this.parent.set(x, x);
    this.rank.set(x, 0);
  }
  
  find(x) {
    if (!this.parent.has(x)) return null;
    if (this.parent.get(x) !== x) {
      // Path compression
      this.parent.set(x, this.find(this.parent.get(x)));
    }
    return this.parent.get(x);
  }
  
  union(x, y) {
    const rootX = this.find(x);
    const rootY = this.find(y);
    
    if (rootX !== rootY) {
      const rankX = this.rank.get(rootX);
      const rankY = this.rank.get(rootY);
      
      if (rankX < rankY) {
        this.parent.set(rootX, rootY);
      } else if (rankX > rankY) {
        this.parent.set(rootY, rootX);
      } else {
        this.parent.set(rootY, rootX);
        this.rank.set(rootX, rankX + 1);
      }
      return true;
    }
    return false;
  }
}

export class GraphNetwork {
  constructor() {
    this.nodes = new Map(); // id -> metadata
    this.adjList = new Map(); // id -> Array<{ to, weight }>
  }
  
  addNode(id, data = null) {
    if (!this.nodes.has(id)) {
      this.nodes.set(id, data);
      this.adjList.set(id, []);
    }
  }
  
  addEdge(from, to, weight = 1, directed = false) {
    this.addNode(from);
    this.addNode(to);
    
    this.adjList.get(from).push({ to, weight });
    if (!directed) {
      this.adjList.get(to).push({ to: from, weight });
    }
  }
  
  getNeighbors(id) {
    return this.adjList.get(id) || [];
  }
  
  /**
   * Dijkstra's Shortest Path Algorithm.
   * @param {any} start - Start node ID.
   * @param {any} end - End node ID.
   * @returns {Object|null} - { path: Array, distance: number } or null if unreachable.
   */
  dijkstra(start, end) {
    if (!this.nodes.has(start) || !this.nodes.has(end)) return null;
    
    const distances = new Map();
    const previous = new Map();
    const pq = new MinHeap();
    
    for (const node of this.nodes.keys()) {
      distances.set(node, Infinity);
    }
    
    distances.set(start, 0);
    pq.push(start, 0);
    
    while (!pq.isEmpty()) {
      const current = pq.pop();
      
      if (current === end) {
        // Reconstruct path
        const path = [];
        let curr = end;
        while (curr !== undefined) {
          path.push(curr);
          curr = previous.get(curr);
        }
        return {
          path: path.reverse(),
          distance: distances.get(end)
        };
      }
      
      const currentDist = distances.get(current);
      for (const edge of this.getNeighbors(current)) {
        const alt = currentDist + edge.weight;
        if (alt < distances.get(edge.to)) {
          distances.set(edge.to, alt);
          previous.set(edge.to, current);
          pq.push(edge.to, alt);
        }
      }
    }
    
    return null; // Unreachable
  }
  
  /**
   * A* Search Shortest Path Algorithm.
   * @param {any} start - Start node ID.
   * @param {any} end - End node ID.
   * @param {Function} heuristicFn - Estimated distance function heuristicFn(nodeId, endId)
   * @returns {Object|null} - { path: Array, distance: number } or null if unreachable.
   */
  astar(start, end, heuristicFn) {
    if (!this.nodes.has(start) || !this.nodes.has(end)) return null;
    
    const gScore = new Map(); // Cost from start to current node
    const fScore = new Map(); // gScore + heuristic estimate
    const previous = new Map();
    const pq = new MinHeap();
    
    for (const node of this.nodes.keys()) {
      gScore.set(node, Infinity);
      fScore.set(node, Infinity);
    }
    
    gScore.set(start, 0);
    const startF = heuristicFn(start, end);
    fScore.set(start, startF);
    pq.push(start, startF);
    
    while (!pq.isEmpty()) {
      const current = pq.pop();
      
      if (current === end) {
        const path = [];
        let curr = end;
        while (curr !== undefined) {
          path.push(curr);
          curr = previous.get(curr);
        }
        return {
          path: path.reverse(),
          distance: gScore.get(end)
        };
      }
      
      const currentG = gScore.get(current);
      for (const edge of this.getNeighbors(current)) {
        const tentativeG = currentG + edge.weight;
        if (tentativeG < gScore.get(edge.to)) {
          previous.set(edge.to, current);
          gScore.set(edge.to, tentativeG);
          const f = tentativeG + heuristicFn(edge.to, end);
          fScore.set(edge.to, f);
          pq.push(edge.to, f);
        }
      }
    }
    
    return null;
  }
  
  /**
   * Kruskal's Minimum Spanning Tree (MST).
   * Supports undirected graphs (converts directed/undirected representations into unique edge lists).
   * @returns {Array<Object>} - Array of edges forming the MST: [{ from, to, weight }].
   */
  kruskalMST() {
    const edges = [];
    const seen = new Set();
    
    for (const [from, neighbors] of this.adjList.entries()) {
      for (const edge of neighbors) {
        // Unique identifier for undirected edges
        const edgeId = [from, edge.to].sort().join('-');
        if (!seen.has(edgeId)) {
          seen.add(edgeId);
          edges.push({ from, to: edge.to, weight: edge.weight });
        }
      }
    }
    
    // Sort edges by weight
    edges.sort((a, b) => a.weight - b.weight);
    
    const dsu = new DisjointSet();
    for (const node of this.nodes.keys()) {
      dsu.makeSet(node);
    }
    
    const mst = [];
    for (const edge of edges) {
      if (dsu.union(edge.from, edge.to)) {
        mst.push(edge);
      }
    }
    
    return mst;
  }
  
  /**
   * Tarjan's Strongly Connected Components (SCC) algorithm.
   * @returns {Array<Array<any>>} - Array of SCC node sets.
   */
  tarjanSCC() {
    let index = 0;
    const indices = new Map();
    const lowlink = new Map();
    const onStack = new Map();
    const stack = [];
    const sccs = [];
    
    const strongconnect = (v) => {
      indices.set(v, index);
      lowlink.set(v, index);
      index++;
      stack.push(v);
      onStack.set(v, true);
      
      const neighbors = this.getNeighbors(v);
      for (const edge of neighbors) {
        const w = edge.to;
        if (!indices.has(w)) {
          strongconnect(w);
          lowlink.set(v, Math.min(lowlink.get(v), lowlink.get(w)));
        } else if (onStack.get(w)) {
          lowlink.set(v, Math.min(lowlink.get(v), indices.get(w)));
        }
      }
      
      if (lowlink.get(v) === indices.get(v)) {
        const scc = [];
        let w;
        do {
          w = stack.pop();
          onStack.set(w, false);
          scc.push(w);
        } while (w !== v);
        sccs.push(scc);
      }
    };
    
    for (const node of this.nodes.keys()) {
      if (!indices.has(node)) {
        strongconnect(node);
      }
    }
    
    return sccs;
  }
}
