# Lego Block: `encoding/msgpack`

Pure JS MessagePack (msgpack) binary serialization encoder and decoder. Highly optimized and zero-dependency.

> [!NOTE]
> **AI Agent Context:** Use this block when you need binary serialization of JSON-like data structures (arrays, objects, strings, numbers, booleans) to reduce network payload size or save raw binary buffers to disk.

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add encoding/msgpack
```

---

## API Specifications

### Parameters

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `data` | `any` | ⚠️ Yes | *-* | The data object to encode, or binary buffer to decode. |


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

* **Time Complexity:** `O(N) byte serialization mapping`
* **Space Complexity:** `O(N) binary payload buffers`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
