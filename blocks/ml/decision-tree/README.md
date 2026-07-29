# Lego Block: `ml/decision-tree`

A zero-dependency Decision Tree Classifier and Regressor engine in pure JavaScript. Calculates split nodes recursively using Gini Impurity, entropy, or variance reduction, and supports max depth, min samples split constraints, and feature importance scores.

> [!NOTE]
> **AI Agent Context:** Use this block when you need a fast, non-linear classification or regression model (such as a decision tree) without importing scikit-learn or external JS ML libraries.

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add ml/decision-tree
```

---

## API Specifications

### Parameters

*None*

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

* **Time Complexity:** `O(N × D × log N) training (N = samples, D = features); O(log N) predict`
* **Space Complexity:** `O(N × D) training data`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
