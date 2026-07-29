# Lego Block: `stream/batch-processor`

Batches streaming data based on item count, size, or time duration before downstream processing.

> [!NOTE]
> **AI Agent Context:** Use this block when you need to group stream items into batches before bulk inserting to a database, uploading to an API, or performing heavy operations.

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add stream/batch-processor
```

---

## API Specifications

### Parameters

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `options` | `Object` | No | *-* | Configuration options: { maxBatchSize, maxTimeMs, maxByteSize, sizeFn } |


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

* **Time Complexity:** `O(N) processing time`
* **Space Complexity:** `O(B) items buffer where B is batch size`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
