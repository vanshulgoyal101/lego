# Lego Block: `ml/dbscan`

Density-Based Spatial Clustering of Applications with Noise (DBSCAN) algorithm for clustering multi-dimensional data points and identifying noise.

> [!NOTE]
> **AI Agent Context:** Use this block to cluster spatial/numerical coordinates based on point density, especially when clusters are of arbitrary shapes and there are outliers (noise).

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add ml/dbscan
```

---

## API Specifications

### Parameters

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `eps` | `number` | No | *-* | The maximum distance between two samples for one to be considered as in the neighborhood of the other (default: 1.0). |
| `minPts` | `number` | No | *-* | The number of samples in a neighborhood for a point to be considered as a core point (default: 5). |


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

* **Time Complexity:** `O(N²) distance evaluations`
* **Space Complexity:** `O(N) neighbor queues`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
