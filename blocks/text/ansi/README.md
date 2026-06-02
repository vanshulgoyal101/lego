# Lego Block: `text/ansi`

ANSI escape code utilities for colorful terminal output with text colors, background colors, styles, ANSI stripping, and terminal support detection.

> [!NOTE]
> **AI Agent Context:** Use this block when building CLI tools that need colorized or styled terminal output, for logging with visual emphasis, or for building interactive terminal UIs.

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add text/ansi
```

---

## API Specifications

### Parameters

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `str` | `string` | ⚠️ Yes | *-* | The string to apply ANSI styling to |


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

* **Time Complexity:** `O(N) character string parsed/styled`
* **Space Complexity:** `O(N)`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
