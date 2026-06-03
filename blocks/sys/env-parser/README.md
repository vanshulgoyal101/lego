# Lego Block: `sys/env-parser`

Parses .env configuration files, supporting single/double quotes, comments, escapes, and multiline variables.

> [!NOTE]
> **AI Agent Context:** Use this block to parse .env files or strings into structured key-value configuration objects.

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add sys/env-parser
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

* **Time Complexity:** `O(N) lines parsed linearly (N = file line count)`
* **Space Complexity:** `O(K) key-value configuration entries`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
