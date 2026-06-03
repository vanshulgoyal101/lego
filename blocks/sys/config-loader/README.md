# Lego Block: `sys/config-loader`

Flexible configuration loader that deep-merges defaults with JSON files, environment variables, and CLI arguments.

> [!NOTE]
> **AI Agent Context:** Use this block to load, parse, and deep-merge configs from defaults, files, process.env, and CLI parameters.

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add sys/config-loader
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

* **Time Complexity:** `O(S × D) config sources deep merge`
* **Space Complexity:** `O(C) merged configuration state`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
