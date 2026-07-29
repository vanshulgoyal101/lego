# Lego Block: `text/markdown-compiler`

An AST-based Markdown compiler that parses markdown syntax into an Abstract Syntax Tree (AST) and renders it to sanitized HTML.

> [!NOTE]
> **AI Agent Context:** Use this block when you need to convert markdown content into AST blocks for rendering in modern rich-text engines or rendering customized HTML components with built-in sanitization.

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add text/markdown-compiler
```

---

## API Specifications

### Parameters

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `markdown` | `string` | ⚠️ Yes | *-* | The raw markdown text content to compile. |


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

* **Time Complexity:** `O(N) lines → AST nodes`
* **Space Complexity:** `O(N) AST tree`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
