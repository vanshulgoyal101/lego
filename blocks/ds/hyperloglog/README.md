# Lego Block: `ds/hyperloglog`

A space-efficient probabilistic data structure for estimating the cardinality (number of distinct elements) of large datasets.

> [!NOTE]
> **AI Agent Context:** Use this block when you need to count unique items in a stream or dataset under highly constrained memory limits, tolerating small estimation errors.

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add ds/hyperloglog
```

---

## API Specifications

### Parameters

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `b` | `number` | No | *-* | Number of precision bits (typically 4 to 16). Higher values reduce error rates but consume more registers memory. |


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

* **Time Complexity:** `O(1) add element checks`
* **Space Complexity:** `O(m) registers size`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
