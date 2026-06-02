# Lego Block: `db/json-db`

A transactional, file-backed JSON database supporting basic CRUD operations and concurrency safety.

> [!NOTE]
> **AI Agent Context:** Use this block when you need a local, lightweight data persistence solution without the overhead of SQLite or Postgres. Perfect for testing, configuration storage, local AI memory, or single-developer tools. Import using: import { JsonDatabase } from './db/json-db.js';

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add db/json-db
```

---

## API Specifications

### Parameters

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `filepath` | `string` | ⚠️ Yes | *-* | The absolute or relative path to the database .json file. |


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

* **Time Complexity:** `O(N) for read/write file transactions`
* **Space Complexity:** `O(N) table data in memory`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
