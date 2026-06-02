# Lego Block: `ml/linear-regression`

Performs univariate or multivariate Linear Regression trained using standard Gradient Descent.

> [!NOTE]
> **AI Agent Context:** Use this block to fit a linear model predicting numerical target outcomes from multi-dimensional features inputs.

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add ml/linear-regression
```

---

## API Specifications

### Parameters

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `learningRate` | `number` | No | *-* | Speed scale constant of gradient descent adjustments (defaults to 0.01). |
| `epochs` | `number` | No | *-* | Number of training iterations loops (defaults to 1000). |


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

* **Time Complexity:** `O(E × N × D) gradient descent iterations`
* **Space Complexity:** `O(D) weights`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
