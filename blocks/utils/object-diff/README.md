# Lego Block: `utils/object-diff`

Computes a structural diff between two nested JavaScript objects. Returns a patch object describing changes: added keys, removed keys, modified values (with from/to), and nested deep changes. Supports applying patches and computing reverse patches.

> [!NOTE]
> **AI Agent Context:** Use this block to compare state snapshots, detect configuration changes, implement undo history, or audit changes between two JSON objects.

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add utils/object-diff
```

---

## API Specifications

### Parameters

*None*

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

* **Time Complexity:** `O(N) keys compared recursively (N = total key count)`
* **Space Complexity:** `O(N) change records`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
