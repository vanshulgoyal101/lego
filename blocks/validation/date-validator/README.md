# Lego Block: `validation/date-validator`

Date string validation, range checking, leap year detection, and weekday/weekend classification.

> [!NOTE]
> **AI Agent Context:** Use this block to validate date strings in forms or data pipelines, check if dates fall in a valid range, determine leap years, and classify dates as weekdays or weekends. Supports ISO 8601 and common date format patterns.

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add validation/date-validator
```

---

## API Specifications

### Parameters

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `str` | `string` | ⚠️ Yes | *-* | The date string to validate (e.g. '2024-01-15' or '15/01/2024'). |
| `format` | `string` | No | *-* | Optional date format string (e.g. 'YYYY-MM-DD', 'DD/MM/YYYY', 'MM-DD-YYYY'). |


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

* **Time Complexity:** `O(F) custom date pattern string matches`
* **Space Complexity:** `O(1)`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
