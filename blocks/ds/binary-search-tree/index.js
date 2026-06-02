class Node {
  constructor(value) {
    this.value = value;
    this.left = null;
    this.right = null;
  }
}

/**
 * A standard Binary Search Tree (BST) implementation.
 * Supports element insertions, checks, removals, and traversals.
 */
export class BinarySearchTree {
  constructor() {
    this.root = null;
  }

  /**
   * Insert a value into the BST.
   * @param {*} value
   */
  insert(value) {
    const newNode = new Node(value);
    if (this.root === null) {
      this.root = newNode;
      return;
    }

    let current = this.root;
    while (true) {
      if (value === current.value) return; // Prevent duplicates
      
      if (value < current.value) {
        if (current.left === null) {
          current.left = newNode;
          return;
        }
        current = current.left;
      } else {
        if (current.right === null) {
          current.right = newNode;
          return;
        }
        current = current.right;
      }
    }
  }

  /**
   * Find if a value exists in the BST.
   * @param {*} value
   * @returns {boolean} True if found.
   */
  find(value) {
    let current = this.root;
    while (current !== null) {
      if (value === current.value) return true;
      current = value < current.value ? current.left : current.right;
    }
    return false;
  }

  /**
   * Delete a value from the BST.
   * @param {*} value
   */
  delete(value) {
    this.root = this._deleteNode(this.root, value);
  }

  /**
   * Internal recursive node deletion.
   * @private
   */
  _deleteNode(node, value) {
    if (node === null) return null;

    if (value < node.value) {
      node.left = this._deleteNode(node.left, value);
      return node;
    } else if (value > node.value) {
      node.right = this._deleteNode(node.right, value);
      return node;
    }

    // Node to delete found

    // Case 1: Leaf node (no children)
    if (node.left === null && node.right === null) {
      return null;
    }

    // Case 2: One child (right)
    if (node.left === null) {
      return node.right;
    }

    // Case 2: One child (left)
    if (node.right === null) {
      return node.left;
    }

    // Case 3: Two children
    // Find the minimum value in the right subtree (inorder successor)
    let minRight = node.right;
    while (minRight.left !== null) {
      minRight = minRight.left;
    }

    node.value = minRight.value;
    node.right = this._deleteNode(node.right, minRight.value);
    return node;
  }

  /**
   * Pre-order depth-first traversal (Root -> Left -> Right).
   * @returns {Array} List of node values.
   */
  traversePreOrder() {
    const result = [];
    const traverse = (node) => {
      if (node === null) return;
      result.push(node.value);
      traverse(node.left);
      traverse(node.right);
    };
    traverse(this.root);
    return result;
  }

  /**
   * In-order depth-first traversal (Left -> Root -> Right).
   * Generates values in sorted order.
   * @returns {Array} Sorted list of node values.
   */
  traverseInOrder() {
    const result = [];
    const traverse = (node) => {
      if (node === null) return;
      traverse(node.left);
      result.push(node.value);
      traverse(node.right);
    };
    traverse(this.root);
    return result;
  }
}
