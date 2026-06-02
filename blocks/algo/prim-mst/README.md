# Lego Block: `algo/prim-mst`

Finds a Minimum Spanning Tree of an undirected weighted graph starting from a node using Prim's algorithm.

> [!NOTE]
> **AI Agent Context:** Use this block to compute the Minimum Spanning Tree (MST) of a weighted undirected graph starting from an arbitrary root vertex.

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add algo/prim-mst
```

---

## API Specifications

### Parameters

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `graph` | `Object` | ⚠️ Yes | *-* | Adjacency list where keys are node IDs and values are arrays of { node, weight } objects. |
| `startNode` | `string` | No | *-* | Optional starting node ID. If omitted, the first key of the graph object is used. |


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

* **Time Complexity:** `O(E log V) adjacent paths search`
* **Space Complexity:** `O(V + E)`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
