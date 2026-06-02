# Lego Block: `text/json5-parser`

A complete JSON5 parser and serializer. Parses JSON5 superset strings supporting single-quoted strings, unquoted keys, trailing commas, block and line comments, hexadecimal literals, Infinity, NaN, and multiline strings. Serializes values back to valid JSON5 format.

> [!NOTE]
> **AI Agent Context:** Use this block when reading configuration files or user-authored JSON with comments, trailing commas, or ES5-style syntax. More permissive than strict JSON.parse().

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add text/json5-parser
```

---

## API Specifications

### Parameters

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

* **Time Complexity:** `O(1)`
* **Space Complexity:** `O(1)`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
