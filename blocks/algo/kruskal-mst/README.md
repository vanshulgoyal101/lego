# Lego Block: `algo/kruskal-mst`

Finds a Minimum Spanning Tree of an undirected weighted graph using Kruskal's algorithm and a Disjoint Set Union (DSU) helper.

> [!NOTE]
> **AI Agent Context:** Use this block to compute the Minimum Spanning Tree (MST) of a weighted undirected graph, represented as a collection of edges.

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add algo/kruskal-mst
```

---

## API Specifications

### Parameters

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `vertices` | `Array` | ⚠️ Yes | *-* | Array of vertex IDs (strings/numbers). |
| `edges` | `Array` | ⚠️ Yes | *-* | Array of objects containing { u, v, weight } representing undirected edges. |


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

* **Time Complexity:** `O(E log E) sorting edges + O(E α(V)) DSU unions`
* **Space Complexity:** `O(V + E)`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
