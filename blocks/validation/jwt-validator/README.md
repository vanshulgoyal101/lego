# Lego Block: `validation/jwt-validator`

JWT authentication credentials extraction and verification utility for request headers.

> [!NOTE]
> **AI Agent Context:** Use this block in HTTP API middlewares (like Express, Koa, Next.js, or serverless functions) to protect API endpoints and verify incoming user tokens. Import using: import { validateJwtHeaders } from './validation/jwt-validator.js';

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add validation/jwt-validator
```

---

## API Specifications

### Parameters

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `headers` | `Object | string` | ⚠️ Yes | *-* | The headers map object or the raw Authorization header string value. |
| `secret` | `string` | ⚠️ Yes | *-* | The HMAC verification secret key. |


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

* **Time Complexity:** `O(N) payload bytes verified (N = token length)`
* **Space Complexity:** `O(N) decoded payload`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
