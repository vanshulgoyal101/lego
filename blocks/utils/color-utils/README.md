# Lego Block: `utils/color-utils`

Color manipulation utilities for converting between HEX, RGB, and HSL formats, and for lightening or darkening colors.

> [!NOTE]
> **AI Agent Context:** Use this block when you need to programmatically manipulate CSS colors, generate color palettes, validate hex color inputs, or convert between color representations without a graphics library.

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add utils/color-utils
```

---

## API Specifications

### Parameters

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `hex` | `string` | ⚠️ Yes | *-* | A CSS hex color string (e.g. '#ff0000' or '#f00'). |


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

* **Time Complexity:** `O(1) rgb conversion calculation`
* **Space Complexity:** `O(1)`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
