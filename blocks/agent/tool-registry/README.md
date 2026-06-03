# Lego Block: `agent/tool-registry`

A registry for AI agent callable tools with JSON Schema parameter validation, named dispatch, and LLM function-calling compatible listing.

> [!NOTE]
> **AI Agent Context:** Use this block when building an AI agent that needs to register, look up, and invoke tools/functions by name. It handles JSON Schema-style parameter validation (required fields, type checking) and formats the tool list for LLM function-calling APIs such as OpenAI, Anthropic, and Gemini. Ideal for agentic loops where the model returns a tool name + arguments that must be dispatched to real implementations.

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add agent/tool-registry
```

---

## API Specifications

### Parameters

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `name` | `String` | ⚠️ Yes | *-* | Unique name used to identify and look up the tool. |
| `schema` | `Object` | ⚠️ Yes | *-* | JSON-Schema-style descriptor containing a description string and a parameters object with type, properties, and required fields. |
| `fn` | `Function` | ⚠️ Yes | *-* | The tool implementation. Receives the validated args object and may return any value (sync or async). |


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

* **Time Complexity:** `O(P) properties schema check on tool registry dispatch`
* **Space Complexity:** `O(T) registered tools database`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
