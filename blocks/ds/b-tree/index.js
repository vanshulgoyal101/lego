class BTreeNode {
  constructor(isLeaf = true) {
    this.isLeaf = isLeaf;
    this.keys = [];   // Array of keys
    this.values = []; // Array of corresponding values
    this.children = []; // Array of children pointers (only if not leaf)
  }
}

export class BTree {
  /**
   * @param {number} [t=3] - Minimum degree of B-Tree.
   * Max keys = 2t - 1, Max children = 2t.
   */
  constructor(t = 3) {
    if (t < 2) {
      throw new Error('Degree t must be at least 2');
    }
    this.t = t;
    this.root = new BTreeNode(true);
  }

  /**
   * Search for a key in the B-Tree.
   * @param {any} key
   * @returns {any} value or undefined
   */
  search(key) {
    return this._search(this.root, key);
  }

  _search(node, key) {
    let i = 0;
    while (i < node.keys.length && key > node.keys[i]) {
      i++;
    }

    if (i < node.keys.length && key === node.keys[i]) {
      return node.values[i];
    }

    if (node.isLeaf) {
      return undefined;
    }

    return this._search(node.children[i], key);
  }

  /**
   * Insert a key-value pair.
   * @param {any} key
   * @param {any} value
   */
  insert(key, value) {
    const root = this.root;
    // If root is full, tree grows in height
    if (root.keys.length === 2 * this.t - 1) {
      const s = new BTreeNode(false);
      this.root = s;
      s.children.push(root);
      this._splitChild(s, 0, root);
      this._insertNonFull(s, key, value);
    } else {
      this._insertNonFull(root, key, value);
    }
  }

  _insertNonFull(node, key, value) {
    let i = node.keys.length - 1;

    if (node.isLeaf) {
      // Find the location to insert and shift elements
      while (i >= 0 && key < node.keys[i]) {
        i--;
      }
      
      // Update existing key
      if (i >= 0 && node.keys[i] === key) {
        node.values[i] = value;
        return;
      }
      
      // Insert new key/value
      node.keys.splice(i + 1, 0, key);
      node.values.splice(i + 1, 0, value);
    } else {
      // Find the child that is going to have the new key
      while (i >= 0 && key < node.keys[i]) {
        i--;
      }
      
      if (i >= 0 && node.keys[i] === key) {
        node.values[i] = value;
        return;
      }

      i++;
      let child = node.children[i];
      if (child.keys.length === 2 * this.t - 1) {
        this._splitChild(node, i, child);
        if (key > node.keys[i]) {
          i++;
        }
      }
      this._insertNonFull(node.children[i], key, value);
    }
  }

  _splitChild(parent, i, child) {
    const t = this.t;
    const z = new BTreeNode(child.isLeaf);
    
    // Split child keys and values
    // z gets the last t - 1 keys
    z.keys = child.keys.splice(t);
    z.values = child.values.splice(t);

    if (!child.isLeaf) {
      z.children = child.children.splice(t);
    }

    // Pull up the middle key
    const midKey = child.keys.pop();
    const midVal = child.values.pop();

    parent.children.splice(i + 1, 0, z);
    parent.keys.splice(i, 0, midKey);
    parent.values.splice(i, 0, midVal);
  }
}
