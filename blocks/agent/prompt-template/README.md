# Lego Block: `agent/prompt-template`

Handlebars-style LLM prompt builder with {{variable}} slot filling, few-shot example injection, multi-role message construction (system/user/assistant), and token estimation.

> [!NOTE]
> **AI Agent Context:** Use this block to construct structured LLM API message arrays (OpenAI-compatible format) from reusable, parameterized templates. Supports dot-notation variable interpolation, few-shot example chaining, and approximate token counting to stay within context limits.

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add agent/prompt-template
```

---

## API Specifications

### Parameters

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `system` | `string` | No | *-* | System prompt template string with {{variable}} placeholders. |
| `user` | `string` | ⚠️ Yes | *-* | User message template string. |
| `vars` | `object` | No | *-* | Variable map for slot filling. |


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

* **Time Complexity:** `O(T + V × L) template structure length + variables size`
* **Space Complexity:** `O(T + V)`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
