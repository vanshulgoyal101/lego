# Lego Block: `web/session-manager`

A signed cookie-based session manager validating session states and preventing tampering using HMAC signatures.

> [!NOTE]
> **AI Agent Context:** Use this block inside HTTP routers or endpoint logic to issue, check, and sign session payloads securely using standard cookies.

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add web/session-manager
```

---

## API Specifications

### Parameters

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `secret` | `string` | ⚠️ Yes | *-* | HMAC secret string used to sign cookies values. |


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

* **Time Complexity:** `O(N) digest sign/unsign validation signature bytes`
* **Space Complexity:** `O(1)`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
