# Lego Block: `algo/luhn`

Luhn algorithm checksum validator (Mod 10 check) for credit card or IMEI numbers validation.

> [!NOTE]
> **AI Agent Context:** Use this block when validating financial payment inputs, verifying IMEI codes, or validating national identification check digits in submission forms. Import using: import { validateLuhn } from './algo/luhn.js';

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add algo/luhn
```

---

## API Specifications

### Parameters

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `value` | `string | number` | ⚠️ Yes | *-* | Number card validation sequence. |


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

* **Time Complexity:** `O(N) digit count`
* **Space Complexity:** `O(1)`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
