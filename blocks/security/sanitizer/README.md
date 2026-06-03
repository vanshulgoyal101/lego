# Lego Block: `security/sanitizer`

DOM/HTML input sanitizer (allowlist-based, XSS-proof).

> [!NOTE]
> **AI Agent Context:** Use this block to safely sanitize HTML input strings against cross-site scripting (XSS) using a configurable tags and attributes allowlist. Import using: import { sanitizeHtml } from './security/sanitizer/index.js';

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add security/sanitizer
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

* **Time Complexity:** `O(N) input string length scan`
* **Space Complexity:** `O(N) output clean string`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
