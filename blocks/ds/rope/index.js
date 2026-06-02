/**
 * @module ds/rope
 *
 * Rope data structure for efficient operations on large strings.
 *
 * A rope represents a string as a binary tree of smaller string chunks.
 * This allows concatenation and splitting in O(log N) time (where N is the
 * total string length), at the cost of O(log N) per character access.
 *
 * Ideal for text editors, patch/diff tools, or any system that performs many
 * insertions, deletions, or concatenations on large strings.
 *
 * Leaf nodes hold actual string fragments; internal nodes only track length
 * of their left child to support O(log N) indexing.
 */

/** Maximum bytes per leaf chunk before further splitting is encouraged */
const LEAF_LIMIT = 64;

/** @private */
class RopeNode {
  /**
   * @param {string|null} text  - String content (only for leaf nodes).
   * @param {RopeNode|null} left  - Left subtree.
   * @param {RopeNode|null} right - Right subtree.
   * @param {number} weight       - Length of the left subtree's string content.
   */
  constructor(text, left, right, weight) {
    this.text = text;     // non-null only for leaves
    this.left = left;
    this.right = right;
    this.weight = weight; // length of left sub-rope (or this node's text length for leaves)
  }

  get isLeaf() {
    return this.text !== null;
  }
}

/**
 * Creates a balanced leaf node from a string fragment.
 * @param {string} text
 * @returns {RopeNode}
 * @private
 */
function makeLeaf(text) {
  return new RopeNode(text, null, null, text.length);
}

/**
 * Returns the total character length of a rope node's subtree.
 * @param {RopeNode|null} node
 * @returns {number}
 * @private
 */
function ropeLength(node) {
  if (node === null) return 0;
  if (node.isLeaf) return node.weight;
  return node.weight + ropeLength(node.right);
}

/**
 * Concatenates two rope nodes into a new internal node.
 * @param {RopeNode|null} left
 * @param {RopeNode|null} right
 * @returns {RopeNode}
 * @private
 */
function ropeConcat(left, right) {
  if (left === null) return right;
  if (right === null) return left;
  return new RopeNode(null, left, right, ropeLength(left));
}

/**
 * Splits a rope node at `index`, returning [left, right] where left holds
 * characters 0..index-1 and right holds characters index..end.
 * @param {RopeNode|null} node
 * @param {number} index
 * @returns {[RopeNode|null, RopeNode|null]}
 * @private
 */
function ropeSplit(node, index) {
  if (node === null) return [null, null];
  if (node.isLeaf) {
    const left = index > 0 ? makeLeaf(node.text.slice(0, index)) : null;
    const right = index < node.weight ? makeLeaf(node.text.slice(index)) : null;
    return [left, right];
  }
  if (index <= node.weight) {
    const [ll, lr] = ropeSplit(node.left, index);
    return [ll, ropeConcat(lr, node.right)];
  } else {
    const [rl, rr] = ropeSplit(node.right, index - node.weight);
    return [ropeConcat(node.left, rl), rr];
  }
}

/**
 * Collects the string content of a rope subtree into an array for joining.
 * @param {RopeNode|null} node
 * @param {string[]} parts
 * @private
 */
function ropeCollect(node, parts) {
  if (node === null) return;
  if (node.isLeaf) { parts.push(node.text); return; }
  ropeCollect(node.left, parts);
  ropeCollect(node.right, parts);
}

/**
 * Rope data structure for efficient large-string manipulation.
 *
 * @example
 * const r1 = new Rope('Hello, ');
 * const r2 = new Rope('World!');
 * const r3 = r1.concat(r2);
 * r3.toString();     // 'Hello, World!'
 * r3.charAt(7);      // 'W'
 * const [a, b] = r3.split(7);
 * a.toString();      // 'Hello, '
 * b.toString();      // 'World!'
 */
export class Rope {
  /**
   * @param {string|RopeNode} [source=''] - Initial content as a string or an existing RopeNode.
   */
  constructor(source = '') {
    if (source instanceof RopeNode) {
      this._root = source;
    } else {
      this._root = source.length > 0 ? makeLeaf(String(source)) : null;
    }
  }

  /**
   * Total number of characters in this rope.
   * @type {number}
   */
  get length() {
    return ropeLength(this._root);
  }

  /**
   * Returns a new Rope that is the concatenation of this rope and another.
   * O(log N) time.
   * @param {Rope} rope - Rope to append.
   * @returns {Rope}
   */
  concat(rope) {
    return new Rope(ropeConcat(this._root, rope._root));
  }

  /**
   * Splits the rope at the given index, returning two new Ropes.
   * The left rope contains characters [0, index) and the right contains [index, length).
   * O(log N) time.
   * @param {number} index - Split position (0-based).
   * @returns {[Rope, Rope]}
   */
  split(index) {
    const [left, right] = ropeSplit(this._root, index);
    return [new Rope(left ?? ''), new Rope(right ?? '')];
  }

  /**
   * Returns the character at the given index.
   * O(log N) time.
   * @param {number} index - 0-based character index.
   * @returns {string} Single character, or '' if out of bounds.
   */
  charAt(index) {
    if (index < 0 || index >= this.length) return '';
    let node = this._root;
    while (node !== null) {
      if (node.isLeaf) return node.text[index] ?? '';
      if (index < node.weight) {
        node = node.left;
      } else {
        index -= node.weight;
        node = node.right;
      }
    }
    return '';
  }

  /**
   * Converts the entire rope to a plain JavaScript string.
   * O(N) time.
   * @returns {string}
   */
  toString() {
    const parts = [];
    ropeCollect(this._root, parts);
    return parts.join('');
  }
}
