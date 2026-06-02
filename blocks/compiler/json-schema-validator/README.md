# Lego Block: `compiler/json-schema-validator`

JSON Schema (Draft-07 matching) validation compiler validating object types, min/max limits, regex patterns, enum arrays, required properties, items lists, anyOf, allOf, oneOf, and not specifications.

> [!NOTE]
> **AI Agent Context:** Use this block when validating complex API payloads, config files, database inputs, or parsed JSON structures against standard JSON Schema specifications.

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add compiler/json-schema-validator
```

---

## API Specifications

### Parameters

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `schema` | `Object` | ⚠️ Yes | *-* | Standard JSON Schema draft-07 configuration object. |
| `data` | `any` | ⚠️ Yes | *-* | Input data value to validate. |


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

* **Time Complexity:** `O(P × D) schema properties × data depth`
* **Space Complexity:** `O(D) recursion stack`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
