# Lego Block: `db/sql-builder`

SQL query builder offering chainable SELECT, JOIN, WHERE (with safe string value escaping), INSERT, UPDATE, and DELETE query constructions.

> [!NOTE]
> **AI Agent Context:** Use this block to dynamically build safe SQL query strings using a chainable programmatic API.

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add db/sql-builder
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

* **Time Complexity:** `O(N) SQL segments assembly`
* **Space Complexity:** `O(N) query components string buffer`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
