class HuffmanNode {
  constructor(char, freq, left = null, right = null) {
    this.char = char;
    this.freq = freq;
    this.left = left;
    this.right = right;
  }
}

/**
 * Huffman Coding Encoder / Decoder
 */
export class HuffmanCoding {
  constructor() {
    this.root = null;
    this.codes = {};
  }

  /**
   * Build Huffman Tree from input text
   * @param {string} text
   */
  buildTree(text) {
    if (!text || text.length === 0) {
      this.root = null;
      this.codes = {};
      return;
    }

    const freqs = {};
    for (const char of text) {
      freqs[char] = (freqs[char] || 0) + 1;
    }

    const nodes = Object.entries(freqs).map(([char, freq]) => new HuffmanNode(char, freq));

    if (nodes.length === 1) {
      // Single character edge case: create a dummy parent node
      this.root = new HuffmanNode(null, nodes[0].freq, nodes[0], null);
    } else {
      while (nodes.length > 1) {
        // Sort nodes ascending by frequency
        nodes.sort((a, b) => a.freq - b.freq);
        const left = nodes.shift();
        const right = nodes.shift();
        const parent = new HuffmanNode(null, left.freq + right.freq, left, right);
        nodes.push(parent);
      }
      this.root = nodes[0] || null;
    }

    this.codes = {};
    this._generateCodes(this.root, '');
  }

  _generateCodes(node, code) {
    if (!node) return;
    if (node.char !== null) {
      this.codes[node.char] = code;
    }
    this._generateCodes(node.left, code + '0');
    this._generateCodes(node.right, code + '1');
  }

  /**
   * Encodes a string to a binary code string representation (e.g. "1101")
   * @param {string} text
   * @returns {string} Encoded bitstring
   */
  encode(text) {
    this.buildTree(text);
    if (!text) return '';
    let result = '';
    for (const char of text) {
      result += this.codes[char];
    }
    return result;
  }

  /**
   * Decodes a binary representation back to the original text
   * @param {string} bitString
   * @returns {string} Decoded text
   */
  decode(bitString) {
    if (!bitString || !this.root) return '';

    let result = '';
    let current = this.root;

    for (const bit of bitString) {
      if (bit === '0') {
        current = current.left;
      } else {
        current = current.right;
      }

      if (!current) {
        // Safe fallback for corrupt bitstrings
        current = this.root;
        continue;
      }

      if (current.char !== null) {
        result += current.char;
        current = this.root;
      }
    }
    return result;
  }
}
