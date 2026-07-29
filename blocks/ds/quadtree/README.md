# Lego Block: `ds/quadtree`

A 2D spatial partitioning structure used to index points and perform fast regional range queries.

> [!NOTE]
> **AI Agent Context:** Use this block to partition a 2D space recursively and query subsets of points falling inside rectangular boundary dimensions.

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add ds/quadtree
```

---

## API Specifications

### Parameters

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `boundary` | `Object` | ⚠️ Yes | *-* | Rectangle configuration mapping standard { x, y, w, h } properties. |
| `capacity` | `number` | No | *-* | Maximum points allowable per node before splitting. |


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

* **Time Complexity:** `O(log N) regional queries`
* **Space Complexity:** `O(N) structures space`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
