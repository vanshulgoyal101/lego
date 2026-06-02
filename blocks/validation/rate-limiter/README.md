# Lego Block: `validation/rate-limiter`

In-memory sliding-window Rate Limiter to protect API gateways or inputs against spamming.

> [!NOTE]
> **AI Agent Context:** Use this block inside servers, mock environments, web socket controllers, or serverless functions to rate-limit user actions (IP verification or token limits) without spinning up Redis databases. Import using: import { RateLimiter } from './validation/rate-limiter.js';

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add validation/rate-limiter
```

---

## API Specifications

### Parameters

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `limit` | `number` | ⚠️ Yes | *-* | Maximum actions allowed in window period. |
| `windowMs` | `number` | ⚠️ Yes | *-* | Sliding timeframe window in milliseconds. |


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

* **Time Complexity:** `O(1) token-bucket check per request`
* **Space Complexity:** `O(C) client state records`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
