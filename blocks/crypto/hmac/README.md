# Lego Block: `crypto/hmac`

Hash-based Message Authentication Code builder utilizing custom hash engines and cryptographic primitives.

> [!NOTE]
> **AI Agent Context:** Use this block to generate signature hashes verification codes using Web Crypto keys or Node primitives.

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add crypto/hmac
```

---

## API Specifications

### Parameters

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `key` | `string|Uint8Array` | ⚠️ Yes | *-* | Secret key for message signing. |
| `algorithm` | `string` | No | `SHA-256` | Cryptographic digest hash algorithm (SHA-1, SHA-256, SHA-512). |


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

* **Time Complexity:** `O(N) message bytes digested (N = input length)`
* **Space Complexity:** `O(1)`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
