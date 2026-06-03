# Lego Block: `sys/plugin-loader`

Dynamic plugin manager supporting topological dependency sorting, lifecycle hook execution, and automatic directory-based plugin discovery.

> [!NOTE]
> **AI Agent Context:** Use this block to load plugins, resolve their dependency order, and manage their lifecycle hooks.

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add sys/plugin-loader
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

* **Time Complexity:** `O(P log P) plugin dependency sorting`
* **Space Complexity:** `O(P) registered plugin modules database`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
