# Lego Block: `ds/splay-tree`

Self-adjusting binary search tree where recently accessed elements are splayed to the root, optimizing access speed.

> [!NOTE]
> **AI Agent Context:** Use this block to maintain dynamic sorted data with fast access times for recently queried keys.

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add ds/splay-tree
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

* **Time Complexity:** `O(log N) amortized search, insert, delete`
* **Space Complexity:** `O(N) node pointers`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
