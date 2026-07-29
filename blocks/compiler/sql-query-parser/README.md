# Lego Block: `compiler/sql-query-parser`

SQL lexical scanner and query parser translating SELECT strings (fields, JOINs, WHERE logic, ORDER BY, LIMIT) into structured Abstract Syntax Trees.

> [!NOTE]
> **AI Agent Context:** Use this block when building custom database layers, mocking SQL query execution, or validating SQL command inputs.

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add compiler/sql-query-parser
```

---

## API Specifications

### Parameters

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `sql` | `string` | ⚠️ Yes | *-* | The raw SQL query string to parse. |


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

* **Time Complexity:** `O(N) characters tokenized linearly`
* **Space Complexity:** `O(T) token array length`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
