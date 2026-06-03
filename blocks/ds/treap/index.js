class TreapNode {
  constructor(key, value, priority = Math.random()) {
    this.key = key;
    this.value = value;
    this.priority = priority;
    this.left = null;
    this.right = null;
  }
}

export class Treap {
  constructor() {
    this.root = null;
  }

  // Rotate right
  _rotateRight(y) {
    const x = y.left;
    const T2 = x.right;
    x.right = y;
    y.left = T2;
    return x;
  }

  // Rotate left
  _rotateLeft(x) {
    const y = x.right;
    const T2 = y.left;
    y.left = x;
    x.right = T2;
    return y;
  }

  insert(key, value, priority) {
    this.root = this._insert(this.root, key, value, priority);
  }

  _insert(node, key, value, priority) {
    if (!node) {
      return new TreapNode(key, value, priority);
    }

    if (key < node.key) {
      node.left = this._insert(node.left, key, value, priority);
      // Fix Heap property
      if (node.left.priority > node.priority) {
        node = this._rotateRight(node);
      }
    } else if (key > node.key) {
      node.right = this._insert(node.right, key, value, priority);
      // Fix Heap property
      if (node.right.priority > node.priority) {
        node = this._rotateLeft(node);
      }
    } else {
      // Update value
      node.value = value;
    }

    return node;
  }

  delete(key) {
    this.root = this._delete(this.root, key);
  }

  _delete(node, key) {
    if (!node) {
      return null;
    }

    if (key < node.key) {
      node.left = this._delete(node.left, key);
    } else if (key > node.key) {
      node.right = this._delete(node.right, key);
    } else {
      // Node to be deleted found
      if (!node.left) {
        return node.right;
      }
      if (!node.right) {
        return node.left;
      }

      // If both children exist, rotate the one with higher priority to the top
      if (node.left.priority > node.right.priority) {
        node = this._rotateRight(node);
        node.right = this._delete(node.right, key);
      } else {
        node = this._rotateLeft(node);
        node.left = this._delete(node.left, key);
      }
    }

    return node;
  }

  find(key) {
    let curr = this.root;
    while (curr) {
      if (key === curr.key) {
        return curr.value;
      }
      curr = key < curr.key ? curr.left : curr.right;
    }
    return undefined;
  }

  contains(key) {
    return this.find(key) !== undefined;
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

  // Splits the treap into two treaps: left keys <= key, right keys > key
  split(key) {
    // We insert a dummy node with given key and infinite priority, then its children will be the split parts
    const dummy = this._insert(this.root, key, null, Infinity);
    const left = new Treap();
    left.root = dummy.left;
    const right = new Treap();
    right.root = dummy.right;
    return { left, right };
  }
}
