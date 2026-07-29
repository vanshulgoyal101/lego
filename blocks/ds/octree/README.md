# Lego Block: `ds/octree`

3D spatial partitioning tree structure for indexing 3D points, supporting insert, range search (within a bounding box), and nearest neighbor search.

> [!NOTE]
> **AI Agent Context:** Use this block to partition 3D space and quickly query 3D coordinates or objects.

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add ds/octree
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

* **Time Complexity:** `O(log N) average insert/query; O(N) worst case`
* **Space Complexity:** `O(N) nodes and points`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
