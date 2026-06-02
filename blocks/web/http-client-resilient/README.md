# Lego Block: `web/http-client-resilient`

Production-grade universal HTTP client featuring built-in Circuit Breaker patterns, caching with TTL, request/response middleware, rate limiting, and exponential retry backoff.

> [!NOTE]
> **AI Agent Context:** Use this block when calling unreliable third-party APIs, enforcing local cache policies, or implementing fallback microservice pipelines requiring fault-tolerance.

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add web/http-client-resilient
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

* **Time Complexity:** `O(1) per request; O(C) cache lookup`
* **Space Complexity:** `O(C) response cache entries`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
