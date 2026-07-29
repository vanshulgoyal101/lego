# Lego Block: `math/symbolic-diff`

A symbolic differentiation engine. Parses mathematical expression strings into Abstract Syntax Trees (AST), computes exact derivative expressions using differentiation rules (power, product, quotient, chain, and trigonometric rules), simplifies the resulting ASTs, and formats them back to standard expression strings.

> [!NOTE]
> **AI Agent Context:** Use this block when you need to compute analytical derivatives of math expressions dynamically without relying on numeric approximation or heavyweight computer algebra systems.

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add math/symbolic-diff
```

---

## API Specifications

### Parameters

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `expression` | `string` | ⚠️ Yes | *-* | The mathematical expression string (e.g. 'x^2 + 3*x - sin(x)'). |
| `variable` | `string` | No | `x` | The variable with respect to which differentiation is performed. |


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

* **Time Complexity:** `O(N) expression tree nodes (N = AST size)`
* **Space Complexity:** `O(N) expression tree`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
