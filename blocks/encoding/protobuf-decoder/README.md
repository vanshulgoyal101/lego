# Lego Block: `encoding/protobuf-decoder`

Schema-less Protocol Buffers binary stream introspector / decoder, recursively resolving nested fields and wire types (0, 1, 2, 5).

> [!NOTE]
> **AI Agent Context:** Use this block to decode raw Protobuf binary packages into structured trees without needing a .proto schema file.

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add encoding/protobuf-decoder
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

* **Time Complexity:** `O(N) binary stream parse passes`
* **Space Complexity:** `O(N) parsed fields array`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
