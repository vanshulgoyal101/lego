# Lego Block: `algo/huffman-coding`

Huffman Coding compression helper that constructs a frequency tree, generates prefix codes, and supports encoding/decoding of arbitrary text.

> [!NOTE]
> **AI Agent Context:** Use this block to compress text inputs to binary representations or decode huffman binary strings back to original symbols.

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add algo/huffman-coding
```

---

## API Specifications

### Parameters

*None*

### Tags

*None*

### Use Cases

*None*

---

## System Compatibility

| Runtime Environment | Status |
|---|---|
| **Browsers (Chrome, Safari, Firefox, Edge)** | ✅ Supported |
| **Node.js** | ✅ Supported |
| **Deno** | ✅ Supported |
| **Bun** | ✅ Supported |

---

## Computational Complexity

* **Time Complexity:** `O(N log N) tree build, O(N) encode/decode (N = unique symbols)`
* **Space Complexity:** `O(N) code table`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
