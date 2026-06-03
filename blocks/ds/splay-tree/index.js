class SplayNode {
  constructor(key, value) {
    this.key = key;
    this.value = value;
    this.left = null;
    this.right = null;
  }
}

export class SplayTree {
  constructor() {
    this.root = null;
  }

  // Right rotate
  _rightRotate(x) {
    const y = x.left;
    x.left = y.right;
    y.right = x;
    return y;
  }

  // Left rotate
  _leftRotate(x) {
    const y = x.right;
    x.right = y.left;
    y.left = x;
    return y;
  }

  /**
   * Splay key to root of the tree.
   */
  _splay(root, key) {
    if (!root || root.key === key) {
      return root;
    }

    if (key < root.key) {
      if (!root.left) return root;

      // Zig-Zig (Left Left)
      if (key < root.left.key) {
        root.left.left = this._splay(root.left.left, key);
        root = this._rightRotate(root);
      }
      // Zig-Zag (Left Right)
      else if (key > root.left.key) {
        root.left.right = this._splay(root.left.right, key);
        if (root.left.right) {
          root.left = this._leftRotate(root.left);
        }
      }

      if (!root.left) return root;
      return this._rightRotate(root);
    } else {
      if (!root.right) return root;

      // Zag-Zig (Right Left)
      if (key < root.right.key) {
        root.right.left = this._splay(root.right.left, key);
        if (root.right.left) {
          root.right = this._rightRotate(root.right);
        }
      }
      // Zag-Zag (Right Right)
      else if (key > root.right.key) {
        root.right.right = this._splay(root.right.right, key);
        root = this._leftRotate(root);
      }

      if (!root.right) return root;
      return this._leftRotate(root);
    }
  }

  insert(key, value) {
    if (!this.root) {
      this.root = new SplayNode(key, value);
      return;
    }

    this.root = this._splay(this.root, key);

    if (this.root.key === key) {
      this.root.value = value; // update existing
      return;
    }

    const node = new SplayNode(key, value);
    if (key < this.root.key) {
      node.right = this.root;
      node.left = this.root.left;
      this.root.left = null;
    } else {
      node.left = this.root;
      node.right = this.root.right;
      this.root.right = null;
    }
    this.root = node;
  }

  find(key) {
    if (!this.root) {
      return undefined;
    }
    this.root = this._splay(this.root, key);
    if (this.root.key === key) {
      return this.root.value;
    }
    return undefined;
  }

  inorder() {
    const res = [];
    this._inorder(this.root, res);
    return res;
  }

  _inorder(node, res) {
    if (node) {
      this._inorder(node.left, res);
      res.push({ key: node.key, value: node.value });
      this._inorder(node.right, res);
    }
  }
}
