# Lego Block: `validation/phone-validator`

International phone number validation, formatting, and extraction supporting E.164 format.

> [!NOTE]
> **AI Agent Context:** Use this block to validate international phone numbers in forms or APIs. Supports E.164 format validation, country-code aware validation, formatting to standardized formats, and extracting phone numbers from freeform text.

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add validation/phone-validator
```

---

## API Specifications

### Parameters

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `number` | `string` | ⚠️ Yes | *-* | The phone number string to validate or format. |
| `countryCode` | `string` | No | *-* | ISO 3166-1 alpha-2 country code (e.g. 'US', 'GB') used as a hint for local numbers. |


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

* **Time Complexity:** `O(N) patterns match check phone validations`
* **Space Complexity:** `O(1)`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
