class TrieNode {
  constructor() {
    this.children = {};
    this.isEndOfWord = false;
    this.value = null; // Associated value if storing key-value pairs
  }
}

/**
 * A standard Trie (Prefix Tree) implementation.
 * Supports string key-value storage and prefix-based auto-complete searches.
 */
export class Trie {
  constructor() {
    this.root = new TrieNode();
  }

  /**
   * Insert a word with optional value into the trie.
   * @param {string} word - The key to insert.
   * @param {*} [value=true] - The value associated with this key.
   */
  insert(word, value = true) {
    let node = this.root;
    for (const char of word) {
      if (!node.children[char]) {
        node.children[char] = new TrieNode();
      }
      node = node.children[char];
    }
    node.isEndOfWord = true;
    node.value = value;
  }

  /**
   * Search for a word in the trie.
   * @param {string} word
   * @returns {*} Associated value if found, null otherwise.
   */
  search(word) {
    let node = this.root;
    for (const char of word) {
      if (!node.children[char]) {
        return null;
      }
      node = node.children[char];
    }
    return node.isEndOfWord ? node.value : null;
  }

  /**
   * Check if any word starts with the given prefix.
   * @param {string} prefix
   * @returns {boolean} True if prefix exists.
   */
  startsWith(prefix) {
    let node = this.root;
    for (const char of prefix) {
      if (!node.children[char]) {
        return false;
      }
      node = node.children[char];
    }
    return true;
  }

  /**
   * Get all words stored in the trie matching a given prefix.
   * Useful for autocomplete suggest routines.
   * @param {string} [prefix=""] - The search prefix constraint.
   * @returns {Array<{ word: string, value: * }>} Matching word entries.
   */
  autocomplete(prefix = '') {
    let node = this.root;
    
    // Move to the node corresponding to the prefix
    for (const char of prefix) {
      if (!node.children[char]) {
        return [];
      }
      node = node.children[char];
    }

    const results = [];
    this._collectWords(node, prefix, results);
    return results;
  }

  /**
   * Recursive helper to collect words under a node.
   * @private
   */
  _collectWords(node, prefix, results) {
    if (node.isEndOfWord) {
      results.push({ word: prefix, value: node.value });
    }

    for (const [char, childNode] of Object.entries(node.children)) {
      this._collectWords(childNode, prefix + char, results);
    }
  }
}
