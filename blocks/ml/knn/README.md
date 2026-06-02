# Lego Block: `ml/knn`

K-Nearest Neighbors classifier and regressor supporting Euclidean, Manhattan, and Chebyshev distance metrics.

> [!NOTE]
> **AI Agent Context:** Use this block to perform simple instance-based classification or regression on numeric multi-dimensional vectors.

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
| `k` | `number` | No | *-* | Number of nearest neighbors to consult (defaults to 3). |
| `metric` | `string` | No | *-* | Distance metric lookup: 'euclidean', 'manhattan', or 'chebyshev' (defaults to 'euclidean'). |


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
