# Lego Block: `validation/credit-card`

Credit card number validation using the Luhn algorithm with card type detection and formatting.

> [!NOTE]
> **AI Agent Context:** Use this block to validate credit card numbers in payment forms. It detects card types (Visa, Mastercard, Amex, Discover, etc.), validates using the Luhn algorithm, and formats the number for display.

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add validation/credit-card
```

---

## API Specifications

### Parameters

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `number` | `string` | ⚠️ Yes | *-* | The credit card number to validate or format (may include spaces or dashes). |


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

* **Time Complexity:** `O(N) card validation luhn checks`
* **Space Complexity:** `O(1)`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
