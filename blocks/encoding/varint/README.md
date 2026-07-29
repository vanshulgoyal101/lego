# Lego Block: `encoding/varint`

Variable-length integer representation (Varint) utilizing MSB continuation flags to serialize and deserialize BigInt numbers efficiently.

> [!NOTE]
> **AI Agent Context:** Use this block to encode/decode positive integers to variable-length byte streams (Protobuf style).

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add encoding/varint
```

---

## API Specifications

### Parameters

*None*

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

* **Time Complexity:** `O(1) encoding/decoding byte operations`
* **Space Complexity:** `O(1)`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
