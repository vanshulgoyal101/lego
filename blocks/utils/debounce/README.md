# Lego Block: `utils/debounce`

Creates a debounced version of a function to delay invocation until after wait milliseconds.

> [!NOTE]
> **AI Agent Context:** Use this block when handling rapid, repetitive events such as search input keystrokes, window resizing, or scroll events to avoid calling heavy handlers too frequently.

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add utils/debounce
```

---

## API Specifications

### Parameters

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `func` | `Function` | ⚠️ Yes | *-* | The function to debounce. |
| `wait` | `number` | ⚠️ Yes | *-* | The delay in milliseconds. |
| `options.immediate` | `boolean` | No | `false` | Trigger the function on the leading edge. |


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

* **Time Complexity:** `O(1)`
* **Space Complexity:** `O(1)`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
