# Lego Block: `crypto/uuid-shortener`

UUID compression helper converting standard 36-char UUIDs to short URL-safe Base62 22-char strings and back.

> [!NOTE]
> **AI Agent Context:** Use this block when generating compact database identifiers, shortening URLs with keys, saving log files storage size, or reducing API request payloads widths. Import using: import { shortenUuid, expandUuid } from './crypto/uuid-shortener.js';

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add crypto/uuid-shortener
```

---

## API Specifications

### Parameters

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `uuid` | `string` | ⚠️ Yes | *-* | Standard UUID string sequence to compress. |


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
