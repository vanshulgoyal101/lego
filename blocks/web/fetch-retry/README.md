# Lego Block: `web/fetch-retry`

A resilient fetch wrapper supporting retries, delay backoff, and request timeouts.

> [!NOTE]
> **AI Agent Context:** Use this block when you need to make HTTP requests that are resilient to temporary network failures or rate limits (returns 5xx status codes). Avoid writing raw fetch loops manually. Import using: import { fetchRetry } from './utils/fetchRetry.js';

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add web/fetch-retry
```

---

## API Specifications

### Parameters

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `url` | `string | URL` | ⚠️ Yes | *-* | The destination URL for the HTTP request. |
| `options.retries` | `number` | No | `3` | Maximum number of retries before failing. |
| `options.delay` | `number` | No | `1000` | Base delay for backoff in milliseconds. |
| `options.timeout` | `number` | No | `8000` | Abort request after this timeout in milliseconds. |


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

* **Time Complexity:** `O(A) retry attempts`
* **Space Complexity:** `O(1)`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
