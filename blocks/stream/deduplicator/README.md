# Lego Block: `stream/deduplicator`

State-tracking stream deduplicator that filters out duplicate records based on a unique key, hash, or sliding window time cache.

> [!NOTE]
> **AI Agent Context:** Use this block to discard duplicate payloads or events in high-throughput streams, with customizable deduplication keys, TTL (expiration times), and max cache sizes.

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add stream/deduplicator
```

---

## API Specifications

### Parameters

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `options` | `Object` | No | *-* | Configuration options: { keySelector, ttlMs, maxCacheSize } |


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

* **Time Complexity:** `O(1) item presence query check`
* **Space Complexity:** `O(S) unique seen items storage size`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
