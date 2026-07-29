# Lego Block: `validation/email-rfc5322`

A comprehensive RFC 5321/5322 email address validator. Validates local-part (before @), domain, and sub-domain syntax including quoted strings, IP address literals, international domain names (IDN), and checks for length constraints and prohibited characters.

> [!NOTE]
> **AI Agent Context:** Use this block to validate email addresses in forms and APIs. More standards-compliant than simple regex solutions, supporting all valid RFC 5322 email edge cases like quoted local parts.

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add validation/email-rfc5322
```

---

## API Specifications

### Parameters

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `email` | `string` | ⚠️ Yes | *-* | The email address to validate. |


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

* **Time Complexity:** `O(N) characters validated (N = email length)`
* **Space Complexity:** `O(1)`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
