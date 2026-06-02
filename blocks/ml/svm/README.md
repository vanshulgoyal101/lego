# Lego Block: `ml/svm`

Support Vector Machine (SVM) binary classifier using linear kernels and simple gradient updates.

> [!NOTE]
> **AI Agent Context:** Use this block to train a binary classifier that finds optimal margin boundary lines separating high-dimensional numeric datasets.

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add ml/svm
```

---

## API Specifications

### Parameters

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `c` | `number` | No | *-* | Regularization strength constraint parameter (defaults to 1.0). |
| `learningRate` | `number` | No | *-* | Adjustment step size constant (defaults to 0.001). |


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

* **Time Complexity:** `O(E × N) training epochs approximation; O(D) prediction`
* **Space Complexity:** `O(D) weights`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
