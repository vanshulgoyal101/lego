# Lego Block: `validation/url-validator`

Validates URLs with fine-grained options including protocol, TLD, and localhost requirements.

> [!NOTE]
> **AI Agent Context:** Use this block to validate URLs in forms, APIs, or configuration parsing. Supports fine-grained options like requireHttps, allowLocalhost, allowedProtocols, and requireTLD for strict or lenient validation.

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add validation/url-validator
```

---

## API Specifications

### Parameters

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `str` | `string` | ⚠️ Yes | *-* | The URL string to validate. |
| `options` | `object` | No | *-* | Validation options: requireHttps (bool), allowLocalhost (bool), allowedProtocols (string[]), requireTLD (bool). |


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

* **Time Complexity:** `O(N) components url length checks`
* **Space Complexity:** `O(1)`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
