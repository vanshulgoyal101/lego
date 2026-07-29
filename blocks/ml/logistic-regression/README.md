# Lego Block: `ml/logistic-regression`

Performs binary classification using Logistic Regression optimized with Gradient Descent.

> [!NOTE]
> **AI Agent Context:** Use this block to train a binary classifier mapping numerical multi-dimensional features to a 0 or 1 probability/classification state.

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add ml/logistic-regression
```

---

## API Specifications

### Parameters

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `learningRate` | `number` | No | *-* | Adjustments step size constant (defaults to 0.1). |
| `epochs` | `number` | No | *-* | Number of training iterations loops (defaults to 1000). |


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

* **Time Complexity:** `O(E × N × D) gradient descent iterations`
* **Space Complexity:** `O(D) weights`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
