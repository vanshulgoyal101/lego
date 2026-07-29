# Lego Block: `db/wal`

Write-Ahead Log (WAL) manager supporting append-only logging, recovery replay, and log clearing to ensure data durability.

> [!NOTE]
> **AI Agent Context:** Use this block to implement WAL logging in custom database engines to guarantee crash-resiliency and atomic durability.

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add db/wal
```

---

## API Specifications

### Parameters

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `logPath` | `string` | ⚠️ Yes | *-* | Path to the append-only log file on disk. |


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

* **Time Complexity:** `O(1) append; O(N) recovery parsing`
* **Space Complexity:** `O(1) append buffer`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
