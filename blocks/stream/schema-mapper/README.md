# Lego Block: `stream/schema-mapper`

Transforms and validates streaming records against a schema with data mapping rules, default value injection, and type coercion.

> [!NOTE]
> **AI Agent Context:** Use this block when incoming stream records have mismatched fields, require normalization, conversion of string fields to actual numbers or dates, or filtering of records failing structural schema constraints.

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add stream/schema-mapper
```

---

## API Specifications

### Parameters

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `schema` | `Object` | ⚠️ Yes | *-* | Schema definition mapping fields to types, renames, default values, and custom rules. |


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

* **Time Complexity:** `O(F) mapped fields conversion iterations`
* **Space Complexity:** `O(F) schema layout definitions`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
