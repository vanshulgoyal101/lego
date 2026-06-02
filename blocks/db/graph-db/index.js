/**
 * Universal, zero-dependency in-memory Graph Database engine.
 * Supports property nodes, labeled edges, Dijkstra pathfinding, and ACID transactional state rollbacks.
 */

function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (Array.isArray(obj)) {
    return obj.map(item => deepClone(item));
  }
  const copy = {};
  for (const k of Object.keys(obj)) {
    copy[k] = deepClone(obj[k]);
  }
  return copy;
}

export class Node {
  constructor(id, label, properties = {}) {
    this.id = id;
    this.label = label;
    this.properties = properties;
  }
}

export class Edge {
  constructor(id, fromNodeId, toNodeId, type, properties = {}, weight = 1) {
    this.id = id;
    this.fromNodeId = fromNodeId;
    this.toNodeId = toNodeId;
    this.type = type;
    this.properties = properties;
    this.weight = weight;
  }
}

export class GraphDb {
  constructor() {
    this.nodes = new Map(); // nodeId -> Node
    this.edges = new Map(); // edgeId -> Edge
    this.adjList = new Map(); // nodeId -> Set(edgeId)
    this.nodeIdCounter = 1;
    this.edgeIdCounter = 1;

    this.inTransaction = false;
    this.transactionSnapshot = null;
  }

  addNode(label, properties = {}) {
    const id = this.nodeIdCounter++;
    const node = new Node(id, label, deepClone(properties));
    this.nodes.set(id, node);
    this.adjList.set(id, new Set());
    return node;
  }

  addEdge(fromNodeId, toNodeId, type, properties = {}, weight = 1) {
    if (!this.nodes.has(fromNodeId)) throw new Error(`NodeNotFoundError: Node ${fromNodeId} does not exist`);
    if (!this.nodes.has(toNodeId)) throw new Error(`NodeNotFoundError: Node ${toNodeId} does not exist`);

    const id = this.edgeIdCounter++;
    const edge = new Edge(id, fromNodeId, toNodeId, type, deepClone(properties), weight);
    this.edges.set(id, edge);
    this.adjList.get(fromNodeId).add(id);
    return edge;
  }

  removeNode(id) {
    if (!this.nodes.has(id)) return false;

    // 1. Delete associated edges
    for (const [edgeId, edge] of this.edges.entries()) {
      if (edge.fromNodeId === id || edge.toNodeId === id) {
        this.removeEdge(edgeId);
      }
    }

    // 2. Remove Node reference
    this.nodes.delete(id);
    this.adjList.delete(id);
    return true;
  }

  removeEdge(id) {
    const edge = this.edges.get(id);
    if (!edge) return false;

    this.adjList.get(edge.fromNodeId).delete(id);
    this.edges.delete(id);
    return true;
  }

  findNodes(query = {}) {
    const results = [];
    for (const node of this.nodes.values()) {
      let match = true;
      if (query.label && node.label !== query.label) match = false;
      if (query.properties) {
        for (const [k, v] of Object.entries(query.properties)) {
          if (node.properties[k] !== v) {
            match = false;
            break;
          }
        }
      }
      if (match) results.push(deepClone(node));
    }
    return results;
  }

  findEdges(query = {}) {
    const results = [];
    for (const edge of this.edges.values()) {
      let match = true;
      if (query.type && edge.type !== query.type) match = false;
      if (query.fromNodeId && edge.fromNodeId !== query.fromNodeId) match = false;
      if (query.toNodeId && edge.toNodeId !== query.toNodeId) match = false;
      if (query.properties) {
        for (const [k, v] of Object.entries(query.properties)) {
          if (edge.properties[k] !== v) {
            match = false;
            break;
          }
        }
      }
      if (match) results.push(deepClone(edge));
    }
    return results;
  }

  /**
   * Performs Dijkstra's algorithm to calculate the shortest path.
   * 
   * @param {number} startId - Starting node ID.
   * @param {number} endId - Ending node ID.
   * @returns {{ path: Array<number>, distance: number } | null} Path details or null.
   */
  shortestPath(startId, endId) {
    if (!this.nodes.has(startId) || !this.nodes.has(endId)) return null;

    const distances = {};
    const previous = {};
    const queue = new Set();

    for (const nodeId of this.nodes.keys()) {
      distances[nodeId] = Infinity;
      previous[nodeId] = null;
      queue.add(nodeId);
    }
    distances[startId] = 0;

    while (queue.size > 0) {
      // Find node with minimum distance
      let currentId = null;
      let minDistance = Infinity;
      for (const id of queue) {
        if (distances[id] < minDistance) {
          minDistance = distances[id];
          currentId = id;
        }
      }

      if (currentId === null || currentId === endId) {
        break;
      }

      queue.delete(currentId);

      // Check neighbors
      const edgeIds = this.adjList.get(currentId) || [];
      for (const edgeId of edgeIds) {
        const edge = this.edges.get(edgeId);
        const neighborId = edge.toNodeId;
        if (!queue.has(neighborId)) continue;

        const alt = distances[currentId] + edge.weight;
        if (alt < distances[neighborId]) {
          distances[neighborId] = alt;
          previous[neighborId] = currentId;
        }
      }
    }

    if (distances[endId] === Infinity) return null;

    const path = [];
    let cur = endId;
    while (cur !== null) {
      path.unshift(cur);
      cur = previous[cur];
    }

    return { path, distance: distances[endId] };
  }

  /**
   * Traverses the graph from a starting node.
   * Supports 'bfs' and 'dfs' modes.
   */
  traverse(startId, mode = 'bfs') {
    if (!this.nodes.has(startId)) return [];

    const visited = new Set();
    const result = [];
    const container = [startId];

    while (container.length > 0) {
      const currentId = mode === 'bfs' ? container.shift() : container.pop();

      if (!visited.has(currentId)) {
        visited.add(currentId);
        result.push(currentId);

        const edgeIds = this.adjList.get(currentId) || [];
        const neighbors = [];
        for (const edgeId of edgeIds) {
          const edge = this.edges.get(edgeId);
          neighbors.push(edge.toNodeId);
        }

        for (const neighborId of neighbors) {
          if (!visited.has(neighborId)) {
            container.push(neighborId);
          }
        }
      }
    }

    return result;
  }

  // ACID transactions
  beginTransaction() {
    if (this.inTransaction) {
      throw new Error('TransactionAlreadyStartedError');
    }
    this.inTransaction = true;
    
    // Snapshot internal structures
    this.transactionSnapshot = {
      nodes: new Map(),
      edges: new Map(),
      adjList: new Map(),
      nodeIdCounter: this.nodeIdCounter,
      edgeIdCounter: this.edgeIdCounter
    };

    for (const [id, node] of this.nodes.entries()) {
      this.transactionSnapshot.nodes.set(id, new Node(node.id, node.label, deepClone(node.properties)));
    }
    for (const [id, edge] of this.edges.entries()) {
      this.transactionSnapshot.edges.set(id, new Edge(edge.id, edge.fromNodeId, edge.toNodeId, edge.type, deepClone(edge.properties), edge.weight));
    }
    for (const [id, edgeSet] of this.adjList.entries()) {
      this.transactionSnapshot.adjList.set(id, new Set(edgeSet));
    }
  }

  commit() {
    if (!this.inTransaction) throw new Error('NoActiveTransactionError');
    this.transactionSnapshot = null;
    this.inTransaction = false;
  }

  rollback() {
    if (!this.inTransaction) throw new Error('NoActiveTransactionError');

    // Restore snapshots in-place to preserve database references
    this.nodes.clear();
    this.edges.clear();
    this.adjList.clear();

    for (const [id, node] of this.transactionSnapshot.nodes.entries()) {
      this.nodes.set(id, node);
    }
    for (const [id, edge] of this.transactionSnapshot.edges.entries()) {
      this.edges.set(id, edge);
    }
    for (const [id, edgeSet] of this.transactionSnapshot.adjList.entries()) {
      this.adjList.set(id, edgeSet);
    }

    this.nodeIdCounter = this.transactionSnapshot.nodeIdCounter;
    this.edgeIdCounter = this.transactionSnapshot.edgeIdCounter;

    this.transactionSnapshot = null;
    this.inTransaction = false;
  }
}
