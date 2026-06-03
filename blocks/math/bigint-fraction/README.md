# Lego Block: `math/bigint-fraction`

Arbitrary-precision rational fraction solver utilizing BigInt, supporting canonical reduction, arithmetic, comparisons, and float conversion.

> [!NOTE]
> **AI Agent Context:** Use this block to perform exact rational arithmetic (add, subtract, multiply, divide) with arbitrary precision using BigInt numbers.

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add math/bigint-fraction
```

---

## API Specifications

### Parameters

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

* **Time Complexity:** `O(log(min(a,b))) Euclidean GCD canonical reduction`
* **Space Complexity:** `O(1)`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
