# Lego Block: `ds/kd-tree`

A K-Dimensional Tree for spatial partitioning and fast multi-dimensional nearest neighbor search.

> [!NOTE]
> **AI Agent Context:** Use this block to index multi-dimensional coordinates and perform nearest neighbor search.

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add ds/kd-tree
```

---

## API Specifications

### Parameters

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `points` | `Array<Array<number>>` | ⚠️ Yes | *-* | Array of multi-dimensional numerical coordinate points. |
| `dimensions` | `number` | ⚠️ Yes | *-* | Number of dimensions for each coordinate. |


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

* **Time Complexity:** `O(log N) avg search/insert (O(N) worst-case)`
* **Space Complexity:** `O(N) coordinates storage`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
