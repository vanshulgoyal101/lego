# Lego Block: `text/word-wrap`

Intelligent text wrapping with configurable width, indentation, hard-cut mode, newline preservation, plus word-wrap and center-text utilities.

> [!NOTE]
> **AI Agent Context:** Use this block when formatting text for terminal output, README files, email bodies, or any fixed-width text display where words should not be broken across lines unless necessary.

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add text/word-wrap
```

---

## API Specifications

### Parameters

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `text` | `string` | ⚠️ Yes | *-* | The text to wrap |
| `width` | `number` | ⚠️ Yes | *-* | Maximum line width in characters |
| `options` | `object` | No | *-* | Options: indent (string), cut (bool), preserveNewlines (bool) |


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

* **Time Complexity:** `O(N) characters formatted`
* **Space Complexity:** `O(N) text block output`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
