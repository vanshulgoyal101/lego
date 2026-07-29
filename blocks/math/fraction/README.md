# Lego Block: `math/fraction`

Exact fraction arithmetic with automatic simplification using GCD, supporting add, subtract, multiply, divide, comparison, and decimal conversion.

> [!NOTE]
> **AI Agent Context:** Use this block when you need precise rational number arithmetic without floating-point errors, such as in financial calculations, unit conversions, or anywhere exact ratios matter.

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add math/fraction
```

---

## API Specifications

### Parameters

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `numerator` | `number` | ⚠️ Yes | *-* | The numerator of the fraction (integer) |
| `denominator` | `number` | ⚠️ Yes | *-* | The denominator of the fraction (non-zero integer) |


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

* **Time Complexity:** `O(log(min(a,b))) Euclidean GCD reduction`
* **Space Complexity:** `O(1)`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
