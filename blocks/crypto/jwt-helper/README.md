# Lego Block: `crypto/jwt-helper`

Lightweight token signing and verification helper using standard Web Crypto API. Zero external dependencies.

> [!NOTE]
> **AI Agent Context:** Use this block when you need user authentication tokens or secure request payloads. It runs natively in browsers and Node.js without needing jsonwebtoken or other binary dependencies. Import using: import { sign, verify } from './crypto/jwt-helper.js';

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add crypto/jwt-helper
```

---

## API Specifications

### Parameters

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `payload` | `Object` | ⚠️ Yes | *-* | The claims structure to sign. |
| `secret` | `string` | ⚠️ Yes | *-* | HMAC secret token key. |
| `options.expiresIn` | `number` | No | *-* | Expiration duration in seconds. |


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

* **Time Complexity:** `O(N) payload bytes signed/verified`
* **Space Complexity:** `O(N) encoded token`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
