# Lego Block: `db/page-cache`

Least Recently Used (LRU) page cache manager simulating dirty page flushing, page storage adapters, and block-based disk operations.

> [!NOTE]
> **AI Agent Context:** Use this block to manage in-memory caches for file blocks/pages in custom database storage engines.

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add db/page-cache
```

---

## API Specifications

### Parameters

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `capacity` | `number` | No | *-* | Maximum number of pages held in memory cache (default: 3). |
| `pageSize` | `number` | No | *-* | Fixed size of each page in bytes (default: 4096). |


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

* **Time Complexity:** `O(1) read/write hit; O(P) page eviction flush worst case`
* **Space Complexity:** `O(C × P) page buffers in memory`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
