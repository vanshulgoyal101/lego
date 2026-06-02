# Lego Block: `db/lsm-tree`

Log-Structured Merge-tree (LSM-Tree) storage engine structure featuring MemTable, flushed Sorted String Tables (SSTables), tombstones, and compaction.

> [!NOTE]
> **AI Agent Context:** Use this block to build write-optimized key-value store backends or understand modern database storage compaction internals.

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add db/lsm-tree
```

---

## API Specifications

### Parameters

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `memTableThreshold` | `number` | No | *-* | Maximum number of keys in the MemTable before flushing to SSTable (default: 3). |


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

* **Time Complexity:** `O(1) put/delete; O(L log S) search from newest to oldest SSTable`
* **Space Complexity:** `O(N) keys storage space`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
