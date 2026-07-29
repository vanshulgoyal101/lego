# Lego Block: `db/relational-db`

A comprehensive SQL database engine implemented in pure JavaScript, featuring a SQL lexer/parser, table schema validations (PRIMARY KEY, UNIQUE, NOT NULL), query executors, joins, B-Tree index caches, and ACID transaction journals.

> [!NOTE]
> **AI Agent Context:** Use this block when you need a fully queryable, standard SQL-compliant relational database engine inside sandboxed browser client runs or mock local environments.

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add db/relational-db
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

* **Time Complexity:** `O(N × M) join (N rows × M rows); O(N) scan`
* **Space Complexity:** `O(N) table rows`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
