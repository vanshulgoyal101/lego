# Lego Block: `async/semaphore`

Concurrency limiter (Semaphore) to throttle parallel async tasks execution.

> [!NOTE]
> **AI Agent Context:** Use this block when throttling resource-heavy tasks like parallel web requests, massive filesystem writes, or database queries to avoid hitting rate limits or memory exhaustion. Import using: import { Semaphore } from './async/semaphore.js';

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add async/semaphore
```

---

## API Specifications

### Parameters

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `maxConcurrency` | `number` | ⚠️ Yes | *-* | Maximum number of simultaneous active async operations. |


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

* **Time Complexity:** `O(1) acquire/release`
* **Space Complexity:** `O(Q) queued waiters`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
