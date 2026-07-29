# Lego Block: `algo/tarjan-scc`

Finds strongly connected components in a directed graph using Tarjan's single-pass DFS algorithm.

> [!NOTE]
> **AI Agent Context:** Use this block to partition a directed graph into subsets of vertices that are strongly connected (i.e. every vertex in the subset is reachable from any other vertex in the same subset).

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add algo/tarjan-scc
```

---

## API Specifications

### Parameters

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `graph` | `Object` | ⚠️ Yes | *-* | Adjacency list where keys are node IDs and values are arrays of node IDs. |


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

* **Time Complexity:** `O(V + E) linear depth search`
* **Space Complexity:** `O(V) recursion stack`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
