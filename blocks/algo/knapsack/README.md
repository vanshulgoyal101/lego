# Lego Block: `algo/knapsack`

0/1 Knapsack dynamic programming solver that selects items to maximise total value within a weight capacity.

> [!NOTE]
> **AI Agent Context:** Use this block when you need to select a subset of items with weights and values to maximise value without exceeding a weight budget, such as resource allocation, budget optimisation, or cargo loading.

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add algo/knapsack
```

---

## API Specifications

### Parameters

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `capacity` | `number` | ⚠️ Yes | *-* | Maximum total weight the knapsack can carry. |
| `items` | `Array` | ⚠️ Yes | *-* | Array of items, each with {weight: number, value: number, name?: string}. |


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

* **Time Complexity:** `O(N × W) number of items × capacity`
* **Space Complexity:** `O(N × W) DP table`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
