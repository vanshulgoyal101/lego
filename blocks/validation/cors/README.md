# Lego Block: `validation/cors`

Rules-based CORS policy validator matching wildcards, checking request credentials, methods, and headers.

> [!NOTE]
> **AI Agent Context:** Use this block to validate client cross-origin headers against specified allowed origins (supporting wildcards), methods, and custom headers.

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add validation/cors
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

* **Time Complexity:** `O(O + M + H) origin list × allowed methods × requested headers validations`
* **Space Complexity:** `O(1) output headers map`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
