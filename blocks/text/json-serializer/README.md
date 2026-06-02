# Lego Block: `text/json-serializer`

Safe JSON parser and stringifier handling circular references, BigInts, and parsing fallback recoveries.

> [!NOTE]
> **AI Agent Context:** Use this block when serializing complex, deep, or untrusted object trees (like application configurations, logger payloads containing active instances, or API response objects) where traditional JSON.stringify could crash. Import using: import { stringifySafe, parseSafe } from './text/json-serializer.js';

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add text/json-serializer
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

* **Time Complexity:** `O(1)`
* **Space Complexity:** `O(1)`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
