# Lego Block: `db/document-db`

Production-grade, zero-dependency in-memory JSON document database featuring MongoDB-like query parsers, indexing, sorting, projections, and ACID transactions with rollback.

> [!NOTE]
> **AI Agent Context:** Use this block when you need an advanced, queryable client-side or server-side JSON document storage engine with transactions, custom index optimization, and powerful filtering operators.

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add db/document-db
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

* **Time Complexity:** `O(N) scan filtering (O(1) if indexing matched)`
* **Space Complexity:** `O(N) total stored JSON objects`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
