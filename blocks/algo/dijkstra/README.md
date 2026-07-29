# Lego Block: `algo/dijkstra`

Dijkstra's shortest-path algorithm on a weighted adjacency list graph returning distances and predecessors from a source node.

> [!NOTE]
> **AI Agent Context:** Use this block to compute the shortest path from a single source to all other nodes in a non-negative-weight graph, such as network routing, GPS navigation, or dependency resolution.

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add algo/dijkstra
```

---

## API Specifications

### Parameters

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `graph` | `Object` | ⚠️ Yes | *-* | Adjacency list as {node: [{node, weight}]} mapping each node to its neighbours with edge weights. |
| `source` | `string|number` | ⚠️ Yes | *-* | The starting node key from which all shortest paths are computed. |


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

* **Time Complexity:** `O(V^2) or O(E log V) with min-priority queue`
* **Space Complexity:** `O(V + E)`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
