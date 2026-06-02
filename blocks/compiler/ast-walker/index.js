export class ASTWalker {
  /**
   * @param {Object} visitors - Object mapping node types to visitor functions: { type: (node, walk) => {} }
   */
  constructor(visitors = {}) {
    this.visitors = visitors;
  }

  /**
   * Traverse the AST node recursively
   *
   * @param {Object} node - AST node containing at least a { type } field
   * @param {*} [context] - Shared payload context passed down the recursion tree
   */
  walk(node, context = null) {
    if (!node || typeof node !== 'object') return;

    const visitor = this.visitors[node.type];
    if (visitor) {
      return visitor(node, (child) => this.walk(child, context), context);
    }

    // Default fallback traversal: traverse any fields containing objects or arrays of objects
    for (const key of Object.keys(node)) {
      const child = node[key];
      if (Array.isArray(child)) {
        for (const el of child) {
          this.walk(el, context);
        }
      } else if (child && typeof child === 'object' && typeof child.type === 'string') {
        this.walk(child, context);
      }
    }
  }
}
