const RED = 'RED';
const BLACK = 'BLACK';

class RBTNode {
  constructor(key, value, color = RED) {
    this.key = key;
    this.value = value;
    this.color = color;
    this.left = null;
    this.right = null;
    this.parent = null;
  }
}

export class RedBlackTree {
  constructor() {
    this.root = null;
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

  insert(key, value) {
    const node = new RBTNode(key, value);
    if (!this.root) {
      this.root = node;
      this.root.color = BLACK;
      return;
    }

    let parent = null;
    let curr = this.root;
    while (curr) {
      parent = curr;
      if (key < curr.key) {
        curr = curr.left;
      } else if (key > curr.key) {
        curr = curr.right;
      } else {
        curr.value = value; // update
        return;
      }
    }

    node.parent = parent;
    if (key < parent.key) {
      parent.left = node;
    } else {
      parent.right = node;
    }

    this._fixInsert(node);
  }

  _rotateLeft(x) {
    const y = x.right;
    x.right = y.left;
    if (y.left) {
      y.left.parent = x;
    }
    y.parent = x.parent;
    if (!x.parent) {
      this.root = y;
    } else if (x === x.parent.left) {
      x.parent.left = y;
    } else {
      x.parent.right = y;
    }
    y.left = x;
    x.parent = y;
  }

  _rotateRight(y) {
    const x = y.left;
    y.left = x.right;
    if (x.right) {
      x.right.parent = y;
    }
    x.parent = y.parent;
    if (!y.parent) {
      this.root = x;
    } else if (y === y.parent.left) {
      y.parent.left = x;
    } else {
      y.parent.right = x;
    }
    x.right = y;
    y.parent = x;
  }

  _fixInsert(k) {
    while (k.parent && k.parent.color === RED) {
      if (k.parent === k.parent.parent.right) {
        const u = k.parent.parent.left; // uncle
        if (u && u.color === RED) {
          u.color = BLACK;
          k.parent.color = BLACK;
          k.parent.parent.color = RED;
          k = k.parent.parent;
        } else {
          if (k === k.parent.left) {
            k = k.parent;
            this._rotateRight(k);
          }
          k.parent.color = BLACK;
          k.parent.parent.color = RED;
          this._rotateLeft(k.parent.parent);
        }
      } else {
        const u = k.parent.parent.right; // uncle
        if (u && u.color === RED) {
          u.color = BLACK;
          k.parent.color = BLACK;
          k.parent.parent.color = RED;
          k = k.parent.parent;
        } else {
          if (k === k.parent.right) {
            k = k.parent;
            this._rotateLeft(k);
          }
          k.parent.color = BLACK;
          k.parent.parent.color = RED;
          this._rotateRight(k.parent.parent);
        }
      }
      if (k === this.root) {
        break;
      }
    }
    this.root.color = BLACK;
  }

  inorder() {
    const res = [];
    this._inorder(this.root, res);
    return res;
  }

  _inorder(node, res) {
    if (node) {
      this._inorder(node.left, res);
      res.push({ key: node.key, value: node.value, color: node.color });
      this._inorder(node.right, res);
    }
  }
}
