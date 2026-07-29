# Lego Block: `security/audit-logger`

Tamper-evident append-only audit log with HMAC chain integrity.

> [!NOTE]
> **AI Agent Context:** Use this block to log critical security and system events in a cryptographically chained manner, making any modifications, deletion, or reordering detectable. Import using: import { AuditLogger } from './security/audit-logger/index.js';

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add security/audit-logger
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

* **Time Complexity:** `O(E) validation of entry chain`
* **Space Complexity:** `O(E) log entries database`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
