export class AVLNode {
  constructor(key, value) {
    this.key = key;
    this.value = value;
    this.height = 1;
    this.left = null;
    this.right = null;
  }
}

export class AVLTree {
  constructor() {
    this.root = null;
  }

  height(node) {
    return node ? node.height : 0;
  }

  balanceFactor(node) {
    return node ? this.height(node.left) - this.height(node.right) : 0;
  }

  updateHeight(node) {
    if (node) {
      node.height = 1 + Math.max(this.height(node.left), this.height(node.right));
    }
  }

  rotateRight(y) {
    const x = y.left;
    const T2 = x.right;

    x.right = y;
    y.left = T2;

    this.updateHeight(y);
    this.updateHeight(x);

    return x;
  }

  rotateLeft(x) {
    const y = x.right;
    const T2 = y.left;

    y.left = x;
    x.right = T2;

    this.updateHeight(x);
    this.updateHeight(y);

    return y;
  }

  balance(node) {
    this.updateHeight(node);
    const balance = this.balanceFactor(node);

    // Left Heavy
    if (balance > 1) {
      if (this.balanceFactor(node.left) < 0) {
        node.left = this.rotateLeft(node.left);
      }
      return this.rotateRight(node);
    }

    // Right Heavy
    if (balance < -1) {
      if (this.balanceFactor(node.right) > 0) {
        node.right = this.rotateRight(node.right);
      }
      return this.rotateLeft(node);
    }

    return node;
  }

  insert(key, value) {
    const insertNode = (node, key, value) => {
      if (!node) {
        return new AVLNode(key, value);
      }

      if (key < node.key) {
        node.left = insertNode(node.left, key, value);
      } else if (key > node.key) {
        node.right = insertNode(node.right, key, value);
      } else {
        node.value = value; // Update value if key already exists
        return node;
      }

      return this.balance(node);
    };

    this.root = insertNode(this.root, key, value);
  }

  find(key) {
    let current = this.root;
    while (current) {
      if (key === current.key) {
        return current.value;
      }
      current = key < current.key ? current.left : current.right;
    }
    return undefined;
  }

  delete(key) {
    const minValueNode = (node) => {
      let current = node;
      while (current.left) {
        current = current.left;
      }
      return current;
    };

    const deleteNode = (node, key) => {
      if (!node) {
        return null;
      }

      if (key < node.key) {
        node.left = deleteNode(node.left, key);
      } else if (key > node.key) {
        node.right = deleteNode(node.right, key);
      } else {
        // Node with only one child or no child
        if (!node.left || !node.right) {
          node = node.left || node.right;
        } else {
          // Node with two children: Get the inorder successor
          const temp = minValueNode(node.right);
          node.key = temp.key;
          node.value = temp.value;
          node.right = deleteNode(node.right, temp.key);
        }
      }

      if (!node) {
        return null;
      }

      return this.balance(node);
    };

    this.root = deleteNode(this.root, key);
  }

  inOrder() {
    const result = [];
    const traverse = (node) => {
      if (node) {
        traverse(node.left);
        result.push({ key: node.key, value: node.value });
        traverse(node.right);
      }
    };
    traverse(this.root);
    return result;
  }
}
