# Lego Block: `utils/template-engine`

Minimal zero-dependency string template engine supporting variable interpolation, conditionals ({{#if}}), and loops ({{#each}}).

> [!NOTE]
> **AI Agent Context:** Use this block when you need simple Mustache/Handlebars-style template rendering without pulling in a full templating library. Suitable for generating HTML snippets, email bodies, configuration files, or any text with dynamic placeholders.

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add utils/template-engine
```

---

## API Specifications

### Parameters

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `template` | `string` | ⚠️ Yes | *-* | The template string containing {{variable}}, {{#if key}}, and {{#each array}} tags. |
| `data` | `object` | ⚠️ Yes | *-* | The data context object whose properties are used to resolve template variables. |


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

* **Time Complexity:** `O(N) template length compiles`
* **Space Complexity:** `O(V) template expressions`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
