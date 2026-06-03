export class DependencyResolver {
  constructor() {
    this.graph = new Map();
  }

  /**
   * Adds a node and its list of dependencies.
   * @param {string} node - Node name
   * @param {string[]} [dependencies=[]] - Nodes that this node depends on
   */
  add(node, dependencies = []) {
    if (!this.graph.has(node)) {
      this.graph.set(node, new Set());
    }
    
    // Ensure all dependencies exist in graph
    for (const dep of dependencies) {
      if (!this.graph.has(dep)) {
        this.graph.set(dep, new Set());
      }
      this.graph.get(node).add(dep);
    }
  }

  /**
   * Resolves the topological order.
   * @returns {string[]} Ordered list of nodes from leaf dependencies to root/dependents
   */
  resolve() {
    const visited = new Set();
    const visiting = new Set();
    const result = [];

    const visit = (node) => {
      if (visiting.has(node)) {
        throw new Error(`Circular dependency detected involving node: ${node}`);
      }
      if (!visited.has(node)) {
        visiting.add(node);
        const deps = this.graph.get(node) || new Set();
        for (const dep of deps) {
          visit(dep);
        }
        visiting.delete(node);
        visited.add(node);
        result.push(node);
      }
    };

    for (const node of this.graph.keys()) {
      visit(node);
    }

    return result;
  }
}
