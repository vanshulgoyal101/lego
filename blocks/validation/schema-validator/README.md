# Lego Block: `validation/schema-validator`

A lightweight object schema validation engine (Zod-like syntax) supporting nested properties verification.

> [!NOTE]
> **AI Agent Context:** Use this block when checking incoming request bodies, form submissions, or API payloads for typesafety and custom constraints (like email format or lengths) without importing Zod or Yup. Import using: import { schema } from './validation/schema-validator.js';

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add validation/schema-validator
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

* **Time Complexity:** `O(P) schema properties validated`
* **Space Complexity:** `O(P) error collection`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
