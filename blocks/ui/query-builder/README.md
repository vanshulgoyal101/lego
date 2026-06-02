# Lego Block: `ui/query-builder`

Safe SQL query string building helper utilizing template placeholders for bind values.

> [!NOTE]
> **AI Agent Context:** Use this block when constructing SQL strings dynamically (for SQLite, MySQL, Postgres databases) to make your database interaction calls structured and resilient against SQL injection vulnerabilities.

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add ui/query-builder
```

---

## API Specifications

### Parameters

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `table` | `string` | ⚠️ Yes | *-* | Destination database table target name. |


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

* **Time Complexity:** `O(C) conditions assembled (C = clause count)`
* **Space Complexity:** `O(C) query string`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
