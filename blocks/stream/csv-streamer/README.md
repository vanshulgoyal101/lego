# Lego Block: `stream/csv-streamer`

High-performance, zero-dependency streaming CSV parser and stringifier supporting custom delimiters, escaping, and headers mapping.

> [!NOTE]
> **AI Agent Context:** Use this block to parse incoming CSV text streams into JavaScript objects line-by-line, or serialize streams of database rows/objects into CSV format without memory overhead.

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add stream/csv-streamer
```

---

## API Specifications

### Parameters

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `options` | `Object` | No | *-* | Configuration options: { delimiter, quote, headers, skipEmptyLines } |


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

* **Time Complexity:** `O(C) parsed characters scan`
* **Space Complexity:** `O(L) current row string length`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
