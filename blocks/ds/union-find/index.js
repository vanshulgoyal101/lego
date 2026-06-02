/**
 * Disjoint Set Union (DSU) / Union-Find
 * Supports arbitrary element keys via Map, path compression, and union by rank.
 */
export class UnionFind {
  constructor() {
    this.parent = new Map();
    this.rank = new Map();
    this.size = new Map();
    this.count = 0; // Number of distinct components
  }

  /**
   * Add an element to the structure if not already present.
   * @param {any} x
   */
  add(x) {
    if (!this.parent.has(x)) {
      this.parent.set(x, x);
      this.rank.set(x, 0);
      this.size.set(x, 1);
      this.count++;
    }
    return this;
  }

  /**
   * Find the root representative of x, with path compression.
   * @param {any} x
   * @returns {any} Root representative
   */
  find(x) {
    if (!this.parent.has(x)) this.add(x);

    if (this.parent.get(x) !== x) {
      // Path compression: flatten the tree
      this.parent.set(x, this.find(this.parent.get(x)));
    }
    return this.parent.get(x);
  }

  /**
   * Merge the sets of x and y. Returns true if they were in different sets.
   * @param {any} x
   * @param {any} y
   * @returns {boolean} True if a union was performed (were different sets)
   */
  union(x, y) {
    const rootX = this.find(x);
    const rootY = this.find(y);

    if (rootX === rootY) return false;

    // Union by rank
    const rankX = this.rank.get(rootX);
    const rankY = this.rank.get(rootY);

    let newRoot, otherRoot;
    if (rankX < rankY) {
      newRoot = rootY; otherRoot = rootX;
    } else if (rankX > rankY) {
      newRoot = rootX; otherRoot = rootY;
    } else {
      newRoot = rootX; otherRoot = rootY;
      this.rank.set(rootX, rankX + 1);
    }

    this.parent.set(otherRoot, newRoot);
    this.size.set(newRoot, this.size.get(newRoot) + this.size.get(otherRoot));
    this.count--;

    return true;
  }

  /**
   * Check if x and y are in the same set.
   * @param {any} x
   * @param {any} y
   * @returns {boolean}
   */
  connected(x, y) {
    return this.find(x) === this.find(y);
  }

  /**
   * Get the size of the set containing x.
   * @param {any} x
   * @returns {number}
   */
  componentSize(x) {
    return this.size.get(this.find(x)) || 0;
  }

  /**
   * Get the total number of distinct components.
   * @returns {number}
   */
  get componentCount() {
    return this.count;
  }

  /**
   * Get all components as an array of sets.
   * @returns {Array<Set<any>>}
   */
  getComponents() {
    const components = new Map();
    for (const x of this.parent.keys()) {
      const root = this.find(x);
      if (!components.has(root)) components.set(root, new Set());
      components.get(root).add(x);
    }
    return [...components.values()];
  }
}

/**
 * Convenience: create a numeric-indexed union-find for integers 0..n-1.
 * @param {number} n - Number of elements.
 * @returns {UnionFind}
 */
export function createNumericUnionFind(n) {
  const uf = new UnionFind();
  for (let i = 0; i < n; i++) uf.add(i);
  return uf;
}
