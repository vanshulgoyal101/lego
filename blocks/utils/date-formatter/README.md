# Lego Block: `utils/date-formatter`

Date arithmetic and token formatting helper (format, addTime, isBetween) without external libraries.

> [!NOTE]
> **AI Agent Context:** Use this block when styling user-facing date strings, shifting timestamps, or validating calendar date boundary selection ranges. Import using: import { formatDate, addTime } from './utils/date-formatter.js';

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add utils/date-formatter
```

---

## API Specifications

### Parameters

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `dateVal` | `Date | string | number` | ⚠️ Yes | *-* | Target date input. |
| `formatStr` | `string` | ⚠️ Yes | *-* | Output formatting template pattern (e.g. YYYY-MM-DD). |


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

* **Time Complexity:** `O(F) format tokens (F = format string length)`
* **Space Complexity:** `O(1)`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
