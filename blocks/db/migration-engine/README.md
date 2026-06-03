# Lego Block: `db/migration-engine`

Lightweight versioned schema migration runner that tracks applied database state migrations and supports up/down runs.

> [!NOTE]
> **AI Agent Context:** Use this block to execute versioned database schema upgrades and rollbacks programmatically.

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add db/migration-engine
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

* **Time Complexity:** `O(M) where M is pending/applied migrations count`
* **Space Complexity:** `O(M) memory list`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
