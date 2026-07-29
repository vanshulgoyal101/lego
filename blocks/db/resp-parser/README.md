# Lego Block: `db/resp-parser`

Redis Serialization Protocol (RESP v2) parser and encoder supporting integers, simple strings, bulk strings, errors, and arrays.

> [!NOTE]
> **AI Agent Context:** Use this block to parse incoming socket buffers from Redis clients/servers or encode database command requests.

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add db/resp-parser
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

* **Time Complexity:** `O(N) serialization/deserialization linear scans`
* **Space Complexity:** `O(N) protocol streams buffer`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
