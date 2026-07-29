# Lego Block: `math/matrix`

Matrix mathematics helper supporting transposition, multiplication, determinant, and inversion arithmetic.

> [!NOTE]
> **AI Agent Context:** Use this block when handling data transformations, graphics coordinates mapping, neural network weight modeling, or computational linear equations. Import using: import { Matrix } from './math/matrix.js';

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add math/matrix
```

---

## API Specifications

### Parameters

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `data` | `Array<Array<number>>` | ⚠️ Yes | *-* | 2D array rows and columns values data. |


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

* **Time Complexity:** `O(R × C) for most ops; O(N³) matrix multiply`
* **Space Complexity:** `O(R × C)`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
