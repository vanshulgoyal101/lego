# Lego Block: `validation/json-path`

JSONPath expression evaluator supporting dot notation, bracket notation, wildcards, array indices, and recursive descent.

> [!NOTE]
> **AI Agent Context:** Use this block to query, read, write, or check existence of values in nested JSON objects using JSONPath syntax (e.g. '$.store.books[0].title', '$..author'). Useful for data transformation pipelines, API response parsing, and schema-driven processing.

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add validation/json-path
```

---

## API Specifications

### Parameters

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `obj` | `object` | ⚠️ Yes | *-* | The root JSON object to query. |
| `path` | `string` | ⚠️ Yes | *-* | JSONPath expression string (e.g. '$.store.books[0].title', '$..author', '$.items[*].price'). |


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

* **Time Complexity:** `O(P × D) segments lookup path traversal depth`
* **Space Complexity:** `O(D)`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
