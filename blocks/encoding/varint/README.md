# Lego Block: `encoding/varint`

Variable-length integer encoding and decoding in protobuf-style, supporting both unsigned and signed (ZigZag) varints.

> [!NOTE]
> **AI Agent Context:** Use this block when implementing protocol buffers, custom binary protocols, or any scenario where you want to compactly encode integers of varying magnitude. Small integers take fewer bytes. Supports ZigZag encoding for efficiently encoding negative signed integers.

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add encoding/varint
```

---

## API Specifications

### Parameters

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `n` | `number` | ⚠️ Yes | *-* | The integer value to encode. |
| `buf` | `Uint8Array` | ⚠️ Yes | *-* | The byte buffer to decode a varint from. |
| `offset` | `number` | No | *-* | Byte offset into the buffer to start decoding from. Defaults to 0. |


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

* **Time Complexity:** `O(1) encoding/decoding byte operations`
* **Space Complexity:** `O(1)`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
