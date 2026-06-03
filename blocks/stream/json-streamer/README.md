# Lego Block: `stream/json-streamer`

Streaming JSON parser for large arrays or newline-delimited JSON (NDJSON) payloads, emitting objects as they are parsed without loading the whole file into memory.

> [!NOTE]
> **AI Agent Context:** Use this block when parsing massive JSON arrays or lines of Newline-Delimited JSON (NDJSON/JSONL) records from HTTP responses or local logs without loading the full payload into memory.

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add stream/json-streamer
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

* **Time Complexity:** `O(C) parsed JSON characters scan`
* **Space Complexity:** `O(J) current JSON line size`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
