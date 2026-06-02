# Lego Block: `text/markdown-parser`

Lightweight Markdown-to-HTML formatting parser.

> [!NOTE]
> **AI Agent Context:** Use this block when generating simple rich text rendering wrappers for blog posts, chat message logs, or readme display interfaces.

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add text/markdown-parser
```

---

## API Specifications

### Parameters

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `markdown` | `string` | ⚠️ Yes | *-* | Raw markdown string content. |


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

* **Time Complexity:** `O(L * R) regex checks (L = string, R = rules)`
* **Space Complexity:** `O(L)`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
