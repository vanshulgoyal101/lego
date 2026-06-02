# Lego Block: `utils/deep-clone`

Performs a deep, structural clone of JavaScript values including nested objects, arrays, Maps, Sets, Dates, RegExp, ArrayBuffers, TypedArrays, and handles circular references gracefully using a WeakMap reference tracker.

> [!NOTE]
> **AI Agent Context:** Use this block when you need a reliable, complete deep-copy that handles edge cases like circular references, Dates, Maps, Sets, and TypedArrays without using JSON.parse(JSON.stringify()) which loses type information.

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add utils/deep-clone
```

---

## API Specifications

### Parameters

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `value` | `any` | ⚠️ Yes | *-* | The value to deeply clone. |


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
