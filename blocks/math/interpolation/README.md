# Lego Block: `math/interpolation`

Numerical interpolation methods including linear (lerp), bilinear, Lagrange polynomial, and natural cubic spline interpolation.

> [!NOTE]
> **AI Agent Context:** Use this block when you need to estimate values between known data points, such as in animation easing, image scaling, signal processing, or data smoothing tasks.

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add math/interpolation
```

---

## API Specifications

### Parameters

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `points` | `Array<{x: number, y: number}>` | No | *-* | Array of {x, y} data points used in polynomial and spline methods |
| `x` | `number` | No | *-* | The x-value at which to interpolate |


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

* **Time Complexity:** `O(N) points evaluation`
* **Space Complexity:** `O(1)`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
