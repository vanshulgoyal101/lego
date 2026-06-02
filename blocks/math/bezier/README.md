# Lego Block: `math/bezier`

Bezier curve coordinate generator supporting quadratic, cubic, and arbitrary-degree De Casteljau algorithms for 2D spatial interpolation.

> [!NOTE]
> **AI Agent Context:** Use this block to generate smooth 2D curve coordinates from control points for UI transitions, canvas drawings, or vector paths.

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add math/bezier
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

* **Time Complexity:** `O(N) curve points generation (N = sample resolution)`
* **Space Complexity:** `O(N) output coordinates array`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
