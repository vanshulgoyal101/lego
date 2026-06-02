/**
 * Huffman Coding - Lossless Data Compression
 * Builds frequency-based binary trees, generates prefix-free codes, encodes/decodes data.
 */

// =================== PRIORITY QUEUE (Min-Heap) ====================
class MinHeap {
  constructor() { this.heap = []; }

  push(node) {
    this.heap.push(node);
    this._siftUp(this.heap.length - 1);
  }

  pop() {
    if (this.heap.length === 1) return this.heap.pop();
    const top = this.heap[0];
    this.heap[0] = this.heap.pop();
    this._siftDown(0);
    return top;
  }

  get size() { return this.heap.length; }

  _siftUp(i) {
    while (i > 0) {
      const parent = (i - 1) >> 1;
      if (this.heap[parent].freq <= this.heap[i].freq) break;
      [this.heap[parent], this.heap[i]] = [this.heap[i], this.heap[parent]];
      i = parent;
    }
  }

  _siftDown(i) {
    const n = this.heap.length;
    while (true) {
      let smallest = i;
      const left = 2 * i + 1;
      const right = 2 * i + 2;
      if (left < n && this.heap[left].freq < this.heap[smallest].freq) smallest = left;
      if (right < n && this.heap[right].freq < this.heap[smallest].freq) smallest = right;
      if (smallest === i) break;
      [this.heap[smallest], this.heap[i]] = [this.heap[i], this.heap[smallest]];
      i = smallest;
    }
  }
}

// =================== HUFFMAN TREE ====================

function buildTree(freqMap) {
  const heap = new MinHeap();

  for (const [symbol, freq] of freqMap.entries()) {
    heap.push({ symbol, freq, left: null, right: null });
  }

  // Edge case: single unique symbol
  if (heap.size === 1) {
    const only = heap.pop();
    heap.push({ symbol: null, freq: only.freq, left: only, right: null });
  }

  while (heap.size > 1) {
    const left = heap.pop();
    const right = heap.pop();
    heap.push({
      symbol: null,
      freq: left.freq + right.freq,
      left,
      right
    });
  }

  return heap.pop();
}

function buildCodeTable(node, prefix = '', table = new Map()) {
  if (!node) return table;

  if (node.symbol !== null && node.left === null && node.right === null) {
    // Leaf node
    table.set(node.symbol, prefix || '0');
  } else {
    if (node.left) buildCodeTable(node.left, prefix + '0', table);
    if (node.right) buildCodeTable(node.right, prefix + '1', table);
  }
  return table;
}

// =================== PUBLIC API ====================

/**
 * Build a Huffman code table from a frequency map.
 * @param {Map<any, number>} freqMap - Map of symbol -> frequency.
 * @returns {Map<any, string>} Map of symbol -> binary code string.
 */
export function buildCodes(freqMap) {
  if (freqMap.size === 0) return new Map();
  const tree = buildTree(freqMap);
  return buildCodeTable(tree);
}

/**
 * Build a frequency map from an input string or byte array.
 * @param {string|Uint8Array} input - Input to analyze.
 * @returns {Map<any, number>} Frequency map.
 */
export function buildFrequencyMap(input) {
  const freqMap = new Map();
  for (const symbol of input) {
    freqMap.set(symbol, (freqMap.get(symbol) || 0) + 1);
  }
  return freqMap;
}

/**
 * Encode a string using the provided code table.
 * @param {string} input - Input string to encode.
 * @param {Map<string, string>} codeTable - Code table from buildCodes().
 * @returns {string} Binary string (e.g. '0011010...')
 */
export function encode(input, codeTable) {
  let result = '';
  for (const char of input) {
    const code = codeTable.get(char);
    if (code === undefined) throw new Error(`Huffman: Symbol '${char}' not found in code table`);
    result += code;
  }
  return result;
}

/**
 * Decode a binary string using the provided code table (inverted).
 * @param {string} encodedBits - Binary string of bits.
 * @param {Map<string, string>} codeTable - Original code table from buildCodes().
 * @returns {string} Decoded original string.
 */
export function decode(encodedBits, codeTable) {
  // Build inverse map: code -> symbol
  const inverseTable = new Map();
  for (const [symbol, code] of codeTable.entries()) {
    inverseTable.set(code, symbol);
  }

  let result = '';
  let current = '';
  for (const bit of encodedBits) {
    current += bit;
    if (inverseTable.has(current)) {
      result += inverseTable.get(current);
      current = '';
    }
  }

  if (current.length > 0) {
    throw new Error(`Huffman: Could not decode remaining bits: ${current}`);
  }

  return result;
}

/**
 * Compute compression ratio.
 * @param {string} input - Original input string.
 * @param {string} encodedBits - Encoded bit string.
 * @returns {{ originalBits: number, compressedBits: number, ratio: number }}
 */
export function compressionStats(input, encodedBits) {
  const originalBits = input.length * 8;
  const compressedBits = encodedBits.length;
  return {
    originalBits,
    compressedBits,
    ratio: originalBits > 0 ? compressedBits / originalBits : 1
  };
}
