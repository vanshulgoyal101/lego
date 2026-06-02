# Lego Block: `ml/random-forest`

Random Forest Ensemble Classifier and Regressor built using bootstrapped Decision Trees and random feature selection.

> [!NOTE]
> **AI Agent Context:** Use this block to train an ensemble of Decision Trees for classification or regression, providing robust predictions and reducing overfitting.

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add ml/random-forest
```

---

## API Specifications

### Parameters

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `nEstimators` | `number` | No | *-* | The number of trees in the forest (default: 10). |
| `maxDepth` | `number` | No | *-* | The maximum depth of the individual trees. |
| `criterion` | `string` | No | *-* | The function to measure the quality of a split: 'gini', 'entropy' or 'mse' (default: 'gini'). |


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

* **Time Complexity:** `O(T × N × D × log N) tree builds`
* **Space Complexity:** `O(T × Nodes) ensemble storage`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
