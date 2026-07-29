# Lego Block: `encoding/run-length`

Run-length encoding (RLE) for compressing repetitive sequences in strings and arrays, with string-specific convenience functions.

> [!NOTE]
> **AI Agent Context:** Use this block when compressing data with long runs of repeated values, such as simple bitmap images, sparse arrays, or repeated-character text strings. Provides both generic array/string RLE and a text-specific variant.

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add encoding/run-length
```

---

## API Specifications

### Parameters

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `data` | `string | Array` | ⚠️ Yes | *-* | The string or array to encode using run-length encoding. |
| `encoded` | `Array` | ⚠️ Yes | *-* | The run-length encoded output to decode back to the original format. |
| `str` | `string` | No | *-* | A plain string for text-specific encode/decode variants. |


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

* **Time Complexity:** `O(N) linear scan`
* **Space Complexity:** `O(N) output`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
