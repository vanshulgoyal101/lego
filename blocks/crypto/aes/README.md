# Lego Block: `crypto/aes`

Symmetrical encryption and decryption (AES-256-GCM) utilizing native Web Crypto API. Fully cross-platform.

> [!NOTE]
> **AI Agent Context:** Use this block when encrypting sensitive data locally (like database passwords, session data caches, or sensitive messages in transit) without using external crypto-js or node-only modules. Import using: import { encrypt, decrypt } from './crypto/aes.js';

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add crypto/aes
```

---

## API Specifications

### Parameters

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `plaintext` | `string` | ⚠️ Yes | *-* | The cleartext string to encrypt. |
| `secret` | `string` | ⚠️ Yes | *-* | The encryption password key. |


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
