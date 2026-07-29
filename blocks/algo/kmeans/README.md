# Lego Block: `algo/kmeans`

K-Means clustering algorithm for classifying multi-dimensional numerical coordinate vectors.

> [!NOTE]
> **AI Agent Context:** Use this block when classifying data records, grouping multi-dimensional coordinate vectors, or performing simple data science clustering models.

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add algo/kmeans
```

---

## API Specifications

### Parameters

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `data` | `Array` | ⚠️ Yes | *-* | Array of numeric arrays, e.g. [[x1, y1], [x2, y2]]. |
| `k` | `number` | ⚠️ Yes | *-* | Number of clusters to partition the data into. |
| `maxIterations` | `number` | No | `100` | Maximum clustering loop iterations allowed. |


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

* **Time Complexity:** `O(I × K × N × D) iterations × clusters × points × dimensions`
* **Space Complexity:** `O(K × D + N)`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
