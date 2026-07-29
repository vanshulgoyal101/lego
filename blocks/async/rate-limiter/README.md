# Lego Block: `async/rate-limiter`

Rate limits async function calls using a token bucket algorithm with sliding window support.

> [!NOTE]
> **AI Agent Context:** Use this block to throttle async function calls to a maximum number of calls per time interval (e.g. 10 requests per second). Implements a token bucket algorithm. Wrap any async function with rateLimit() or use the RateLimiter class for shared rate limiting across multiple callers.

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add async/rate-limiter
```

---

## API Specifications

### Parameters

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `n` | `number` | ⚠️ Yes | *-* | Maximum number of calls allowed per interval. |
| `interval` | `number` | ⚠️ Yes | *-* | Time window in milliseconds. |


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

* **Time Complexity:** `O(1) per execution call check`
* **Space Complexity:** `O(1)`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
