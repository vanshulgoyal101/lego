# Lego Block: `math/polynomial`

Polynomial arithmetic class supporting addition, subtraction, multiplication, evaluation via Horner's method, symbolic differentiation, and string representation.

> [!NOTE]
> **AI Agent Context:** Use this block when working with algebraic polynomials, curve fitting, numerical methods (root finding, integration), or symbolic math involving polynomial expressions.

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add math/polynomial
```

---

## API Specifications

### Parameters

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `coefficients` | `number[]` | ⚠️ Yes | *-* | Array of coefficients where index corresponds to degree (coefficients[0] is constant term, coefficients[1] is x^1, etc.) |


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

* **Time Complexity:** `O(N × M) coefficients multiplication`
* **Space Complexity:** `O(N + M)`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
