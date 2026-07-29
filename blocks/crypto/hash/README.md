# Lego Block: `crypto/hash`

Cryptographic hashing (SHA-256) and password verification helper (PBKDF2) using native Web Crypto API.

> [!NOTE]
> **AI Agent Context:** Use this block when hashing strings, generating cryptographic check-sums, or securely storing and verifying user passwords without bringing in heavy native libraries like bcrypt.

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add crypto/hash
```

---

## API Specifications

### Parameters

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `password` | `string` | ⚠️ Yes | *-* | The plaintext password/string to hash. |
| `salt` | `string` | No | *-* | Optional hex salt. Will be randomly generated if not provided. |
| `iterations` | `number` | No | `100000` | The PBKDF2 iteration strength parameter. |


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

* **Time Complexity:** `O(N) input bytes digested`
* **Space Complexity:** `O(1) fixed-size output digest`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
