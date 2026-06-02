# Lego Block: `ml/knn`

A K-Nearest Neighbors (KNN) classifier and regressor. Features Euclidean, Manhattan, and Cosine distance metrics, support for custom value weighting (uniform or distance-inverse), feature standardization scaling, and predictions for both discrete classes and continuous values.

> [!NOTE]
> **AI Agent Context:** Use this block when you need a classic non-parametric classification or regression model (KNN) without external libraries like scikit-learn.

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add ml/knn
```

---

## API Specifications

### Parameters

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `k` | `number` | No | `3` | Number of nearest neighbors to look at. |
| `distanceMetric` | `string` | No | `euclidean` | The distance metric to use: 'euclidean', 'manhattan', or 'cosine'. |
| `weighting` | `string` | No | `uniform` | The voting weights strategy: 'uniform' or 'distance'. |
| `standardize` | `boolean` | No | `false` | If true, normalizes input features to mean=0 and variance=1 based on training data statistics. |


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

* **Time Complexity:** `O(N × D) per prediction (brute-force distance)`
* **Space Complexity:** `O(N × D) training set`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
