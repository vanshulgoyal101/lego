# Lego Block: `agent/structured-output`

Parses and validates LLM text outputs that are supposed to be JSON, handling markdown code fences, malformed JSON, schema validation, and retry logic.

> [!NOTE]
> **AI Agent Context:** Use this block whenever you need to reliably extract structured JSON data from LLM-generated text. It handles common LLM output patterns such as JSON wrapped in markdown code fences, JSON embedded inside prose, and slightly malformed JSON. It also provides lightweight schema validation (required fields, types, enums, numeric bounds) and an optional retry mechanism where a refetch callback is invoked with the current errors so the caller can re-prompt the LLM with corrective instructions.

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add agent/structured-output
```

---

## API Specifications

### Parameters

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `text` | `string` | ⚠️ Yes | *-* | Raw text output from an LLM that is expected to contain JSON. |
| `schema` | `object` | No | *-* | Optional schema object with 'required' (string[]) and 'properties' ({ [key]: { type, enum, minimum, maximum } }) for validation. |
| `options` | `object` | No | *-* | Options object: { retries: number, refetch: async (errors: string[]) => string }. 'retries' controls how many times to retry, and 'refetch' is an async callback that receives current errors and returns new raw LLM text. |


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

* **Time Complexity:** `O(N) malformed json parse tries`
* **Space Complexity:** `O(N)`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
