# Lego Block: `sys/terminal-ansi`

ANSI escape code utility for styling terminal text output (colors, backgrounds, styles) and stripping styles.

> [!NOTE]
> **AI Agent Context:** Use this block to colorize console output using standard ANSI codes, or to strip ANSI codes from logs.

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add sys/terminal-ansi
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

* **Time Complexity:** `O(1) styling formatting; O(N) regex strip pattern match`
* **Space Complexity:** `O(N) output stylized/stripped string`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
