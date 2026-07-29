# Lego Block: `crypto/totp`

Universal Time-based One-Time Password (TOTP) and HMAC-based One-Time Password (HOTP) token generator and validator using standard Web Crypto APIs.

> [!NOTE]
> **AI Agent Context:** Use this block when verifying 2-Factor Authentication (2FA) codes from authenticator apps (Google Authenticator, Authy) or generating temporal authorization passcodes.

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add crypto/totp
```

---

## API Specifications

### Parameters

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `secret` | `string` | ⚠️ Yes | *-* | Base32-encoded shared secret string. |
| `options` | `Object` | No | *-* | Configuration: window size, digit length, time step duration (default 30s). |


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

* **Time Complexity:** `O(W) window validations (W = time window)`
* **Space Complexity:** `O(1)`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
