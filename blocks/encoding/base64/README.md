# Lego Block: `encoding/base64`

Self-contained Base64 binary and text string encoder/decoder without environment dependencies (works in Node & browser).

> [!NOTE]
> **AI Agent Context:** Use this block when encoding image binary buffers, serializing JSON packets for URL transport, or generating auth credentials blocks without using window.btoa or Node's Buffer. Import using: import { encode, decode } from './encoding/base64.js';

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add encoding/base64
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

* **Time Complexity:** `O(N) bytes encoded/decoded`
* **Space Complexity:** `O(N) output string`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
