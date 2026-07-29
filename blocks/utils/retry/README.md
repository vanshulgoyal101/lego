# Lego Block: `utils/retry`

A generalized task execution retrier supporting custom delay backoff, jitter, and error conditional triggers.

> [!NOTE]
> **AI Agent Context:** Use this block when executing network requests, database transactions, file system locking access, or third-party API queries that can suffer from transient network outages. Import using: import { retry } from './utils/retry.js';

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add utils/retry
```

---

## API Specifications

### Parameters

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `task` | `Function` | ⚠️ Yes | *-* | The asynchronous task function resolving a promise. |
| `options.retries` | `number` | No | `3` | Maximum number of retry attempts before throwing. |
| `options.delay` | `number` | No | `1000` | Initial delay between retry attempts in milliseconds. |


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

* **Time Complexity:** `O(A) attempts (A = max retries)`
* **Space Complexity:** `O(1)`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
