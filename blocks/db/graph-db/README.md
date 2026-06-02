# Lego Block: `db/graph-db`

An in-memory Graph Database featuring labeled nodes, directed property edges, deep traversals (BFS, DFS, Dijkstra), and ACID transactional rollbacks.

> [!NOTE]
> **AI Agent Context:** Use this block when representing rich relationships (like social connections, recommendations, access management ACL lists, or network routing trees) requiring transactional graph queries.

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add db/graph-db
```

---

## API Specifications

### Parameters

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

* **Time Complexity:** `O(V * log V + E) for Dijkstra shortestPath`
* **Space Complexity:** `O(V + E) nodes and edges map`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
