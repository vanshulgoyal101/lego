class DisjointSet {
  constructor(elements) {
    this.parent = {};
    this.rank = {};
    for (const el of elements) {
      this.parent[el] = el;
      this.rank[el] = 0;
    }
  }

  find(i) {
    if (this.parent[i] === i) return i;
    this.parent[i] = this.find(this.parent[i]); // path compression
    return this.parent[i];
  }

  union(i, j) {
    const rootI = this.find(i);
    const rootJ = this.find(j);
    if (rootI !== rootJ) {
      if (this.rank[rootI] < this.rank[rootJ]) {
        this.parent[rootI] = rootJ;
      } else if (this.rank[rootI] > this.rank[rootJ]) {
        this.parent[rootJ] = rootI;
      } else {
        this.parent[rootJ] = rootI;
        this.rank[rootI]++;
      }
      return true;
    }
    return false;
  }
}

/**
 * Kruskal's Minimum Spanning Tree Algorithm
 *
 * @param {Array<string|number>} vertices - Array of vertex labels
 * @param {Array<Object>} edges - Array of edges: { u, v, weight }
 * @returns {Object} { mstEdges, totalWeight }
 */
export function kruskalMst(vertices, edges) {
  const sortedEdges = [...edges].sort((a, b) => a.weight - b.weight);
  const dsu = new DisjointSet(vertices);
  const mstEdges = [];
  let totalWeight = 0;

  for (const edge of sortedEdges) {
    if (dsu.union(edge.u, edge.v)) {
      mstEdges.push(edge);
      totalWeight += edge.weight;
      if (mstEdges.length === vertices.length - 1) {
        break;
      }
    }
  }

  return { mstEdges, totalWeight };
}
