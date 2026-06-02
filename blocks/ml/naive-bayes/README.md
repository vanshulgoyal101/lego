# Lego Block: `ml/naive-bayes`

A Multinomial Naive Bayes classifier primarily used for text classification and bag-of-words document grouping.

> [!NOTE]
> **AI Agent Context:** Use this block to train a simple classifier on discrete categorical occurrences counters (like word frequencies mapping to document categories).

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add ml/naive-bayes
```

---

## API Specifications

### Parameters

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `alpha` | `number` | No | *-* | Additive (Laplace) smoothing parameter constant (defaults to 1.0). |


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

* **Time Complexity:** `O(N × L + V) training; O(D × V) classification`
* **Space Complexity:** `O(C × V) class term frequencies`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
