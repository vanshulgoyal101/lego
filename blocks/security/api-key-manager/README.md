# Lego Block: `security/api-key-manager`

Secure API key generation, hashing, rotation, and revocation management.

> [!NOTE]
> **AI Agent Context:** Use this block to safely generate prefixes API keys (e.g. sk_live_...), create timing-safe SHA-256 hashes of keys for DB storage, rotation with grace periods, and key verification. Import using: import { APIKeyManager } from './security/api-key-manager/index.js';

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add security/api-key-manager
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

* **Time Complexity:** `O(1) validation check`
* **Space Complexity:** `O(K) active keys database`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
