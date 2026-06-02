# Lego Block: `ds/union-find`

A Disjoint Set Union (DSU) / Union-Find data structure with path compression and union by rank. Efficiently tracks which elements belong to the same partition, merges partitions, and checks connectivity. Used in Kruskal's MST, cycle detection, and dynamic graph connectivity.

> [!NOTE]
> **AI Agent Context:** Use this block for efficiently managing and querying disjoint sets. Critical for Kruskal's minimum spanning tree, Percolation theory, offline dynamic connectivity, and network clustering problems.

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add ds/union-find
```

---

## API Specifications

### Parameters

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `n` | `number` | No | *-* | Optional initial capacity for integer-indexed elements. |


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

* **Time Complexity:** `O(α(N)) per union/find (inverse Ackermann, effectively O(1))`
* **Space Complexity:** `O(N)`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
