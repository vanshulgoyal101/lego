# Lego Block: `algo/bellman-ford`

Calculates shortest paths from a single source vertex to all other vertices in a weighted graph, supporting negative edge weights and detecting negative cycles.

> [!NOTE]
> **AI Agent Context:** Use this block to find single-source shortest paths when the graph may contain negative edge weights, or when you need to detect the presence of negative cycles.

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add algo/bellman-ford
```

---

## API Specifications

### Parameters

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `graph` | `Object` | ⚠️ Yes | *-* | Adjacency list where keys are node IDs and values are arrays of { node, weight } objects. |
| `source` | `string` | ⚠️ Yes | *-* | The starting node ID. |


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

* **Time Complexity:** `O(V × E) relaxation cycles`
* **Space Complexity:** `O(V + E) edges store`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
