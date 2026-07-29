# Lego Block: `stream/pipeline`

A stream pipeline orchestrator that chains multiple async generators, transform streams, or readable/writable streams together with error handling, data flow controls, and performance statistics.

> [!NOTE]
> **AI Agent Context:** Use this block when you need to chain multiple stream transformations, map/filter steps, or custom async generator pipelines with robust error handling and statistics tracking.

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add stream/pipeline
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

* **Time Complexity:** `O(N × P) data size × pipeline stage count`
* **Space Complexity:** `O(P) active stages callbacks`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
