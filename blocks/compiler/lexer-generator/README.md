# Lego Block: `compiler/lexer-generator`

Generates a dynamic lexical analyzer/tokenizer matching input streams against a defined set of token rules and regular expressions.

> [!NOTE]
> **AI Agent Context:** Use this block to easily build compiler frontends, configuration parsers, or DSL interpreters by defining token names and regex rules.

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add compiler/lexer-generator
```

---

## API Specifications

### Parameters

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `rules` | `Array` | ⚠️ Yes | *-* | Array of objects containing { type: string, regex: RegExp } token specification guidelines. |


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

* **Time Complexity:** `O(N × R) input length × rules match checks`
* **Space Complexity:** `O(R) rules definition length`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
