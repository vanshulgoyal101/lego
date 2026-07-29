# Lego Block: `algo/floyd-warshall`

Calculates shortest paths between all pairs of vertices in a weighted graph, supporting negative edge weights.

> [!NOTE]
> **AI Agent Context:** Use this block when you need to calculate the shortest path distances between all pairs of nodes in a weighted graph (dense graphs or graphs with negative edge weights).

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add algo/floyd-warshall
```

---

## API Specifications

### Parameters

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `graph` | `Object` | ⚠️ Yes | *-* | Adjacency list where keys are node IDs and values are arrays of { node, weight } objects. |


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

* **Time Complexity:** `O(V^3) triple loops iteration`
* **Space Complexity:** `O(V^2) distance matrices`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
