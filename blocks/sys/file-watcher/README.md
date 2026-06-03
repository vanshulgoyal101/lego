# Lego Block: `sys/file-watcher`

Cross-platform file and directory change watcher supporting both native FS events and polling fallback.

> [!NOTE]
> **AI Agent Context:** Use this block to monitor files and directories for changes, creations, and deletions using native events or polling.

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add sys/file-watcher
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

* **Time Complexity:** `O(F) checked files loop`
* **Space Complexity:** `O(F) file state snapshot registry`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
