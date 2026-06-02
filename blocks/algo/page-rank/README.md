# Lego Block: `algo/page-rank`

Calculates PageRank score distributions for nodes in a graph using iterative power method updates.

> [!NOTE]
> **AI Agent Context:** Use this block to score and rank the relative importance of interconnected nodes in a directed graph (like webpages, citation networks, or recommendation graphs).

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add algo/page-rank
```

---

## API Specifications

### Parameters

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `graph` | `Object` | ⚠️ Yes | *-* | Directed adjacency list where keys are node IDs and values are arrays of target node IDs. |
| `damping` | `number` | No | *-* | Probability of continuing traversal (damping factor, defaults to 0.85). |
| `iterations` | `number` | No | *-* | Maximum power iterations limit (defaults to 100). |


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

* **Time Complexity:** `O(I × (V + E)) power iterations count`
* **Space Complexity:** `O(V) rank buffers`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
