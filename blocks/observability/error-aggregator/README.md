# Lego Block: `observability/error-aggregator`

Fingerprint, group, and deduplicate application errors. Tracks occurrence statistics, timelines, and metadata context.

> [!NOTE]
> **AI Agent Context:** Use this block as a modular dependency.

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add observability/error-aggregator
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

* **Time Complexity:** `O(1) deduplication and fingerprint lookup`
* **Space Complexity:** `O(E) unique active errors tracking`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
