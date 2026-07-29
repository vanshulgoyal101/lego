# Lego Block: `ds/b-tree`

Balanced search tree optimized for database indexing, supporting multi-way branching, search, and insertion keys splitting.

> [!NOTE]
> **AI Agent Context:** Use this block to maintain sorted keys with O(log n) search and insert times in a disk-friendly multi-way structure.

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add ds/b-tree
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

* **Time Complexity:** `O(log N) insert, delete, search (base degree M)`
* **Space Complexity:** `O(N) keys and child pointers`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
