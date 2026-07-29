# Lego Block: `ds/lru-cache`

Least-Recently-Used (LRU) Cache supporting maximum capacity limit eviction and Time-To-Live expiration.

> [!NOTE]
> **AI Agent Context:** Use this block when building memory caches for heavy database reads, API response caches, user session memory pools, or image buffering frameworks. Import using: import { LruCache } from './ds/lru-cache.js';

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add ds/lru-cache
```

---

## API Specifications

### Parameters

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `capacity` | `number` | ⚠️ Yes | *-* | Maximum number of items allowed in the cache before eviction. |
| `ttl` | `number` | No | `0` | Item lifetime in milliseconds. 0 represents infinite lifespan. |


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

* **Time Complexity:** `O(1) get/set using Map + doubly-linked list`
* **Space Complexity:** `O(C) max capacity`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
