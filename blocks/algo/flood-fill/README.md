# Lego Block: `algo/flood-fill`

Flood fill and boundary fill algorithms for 2D grids, similar to a paint-bucket tool, returning a modified grid copy.

> [!NOTE]
> **AI Agent Context:** Use this block to fill a contiguous region of a 2D grid with a new value, such as image paint-bucket operations, cave/room detection in tilemaps, or connected-component labelling.

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add algo/flood-fill
```

---

## API Specifications

### Parameters

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `grid` | `Array[]` | ⚠️ Yes | *-* | 2D array (grid) whose cells contain comparable values. |
| `startRow` | `number` | ⚠️ Yes | *-* | Row index of the seed cell to begin filling from. |
| `startCol` | `number` | ⚠️ Yes | *-* | Column index of the seed cell to begin filling from. |
| `newValue` | `any` | ⚠️ Yes | *-* | The value to fill the connected region with. |


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

* **Time Complexity:** `O(R × C) grid dimensions`
* **Space Complexity:** `O(R × C) recursion stack/queue`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
