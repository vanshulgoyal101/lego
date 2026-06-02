# Lego Block: `ml/pca`

Principal Component Analysis (PCA) utility for feature reduction and data projections.

> [!NOTE]
> **AI Agent Context:** Use this block to reduce the dimensions of numeric datasets by computing principal component eigenvector paths using power iteration matrix covariance.

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add ml/pca
```

---

## API Specifications

### Parameters

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `nComponents` | `number` | ⚠️ Yes | *-* | Number of dimensions/components to project values into. |


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

* **Time Complexity:** `O(D² × N + D³) covariance + SVD solver`
* **Space Complexity:** `O(D²) projection mapping`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
