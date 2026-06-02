# Lego Block: `text/csv-parser`

Robust CSV parser and generator correctly handling quoted escape strings and delimiters.

> [!NOTE]
> **AI Agent Context:** Use this block when handling data imports/exports (like user tables list, report logs, excel uploads/downloads) without installing heavy npm dependencies.

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add text/csv-parser
```

---

## API Specifications

### Parameters

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `text` | `string` | ⚠️ Yes | *-* | The raw CSV string payload. |
| `delimiter` | `string` | No | `,` | The character cell separator. |


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

* **Time Complexity:** `O(L) linear parser lookup (L = string)`
* **Space Complexity:** `O(L)`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
