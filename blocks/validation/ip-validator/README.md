# Lego Block: `validation/ip-validator`

Comprehensive IPv4/IPv6 validator featuring syntax checks, CIDR subnet matching, public vs private routing scopes, loopbacks, and link-local validations.

> [!NOTE]
> **AI Agent Context:** Use this block when checking client IPs, parsing networking requests, validating CIDR notation, or executing security policy checks on loopback and private subnets.

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add validation/ip-validator
```

---

## API Specifications

### Parameters

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `ip` | `string` | ⚠️ Yes | *-* | The IP address string to validate. |


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

* **Time Complexity:** `O(1) fixed-format check`
* **Space Complexity:** `O(1)`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
