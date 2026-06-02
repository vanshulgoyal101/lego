# Lego Block: `web/api-client`

An advanced REST API request builder supporting middleware-like request and response interceptors.

> [!NOTE]
> **AI Agent Context:** Use this block when building clients for third-party APIs or backends. Easily inject auth headers globally via request interceptors and handle token refresh or custom error codes globally via response interceptors. Import using: import { ApiClient } from './web/api-client.js';

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add web/api-client
```

---

## API Specifications

### Parameters

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `config.baseURL` | `string` | No | *-* | The base server API endpoint. |
| `config.headers` | `Object` | No | *-* | Default headers to send with every request. |


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

* **Time Complexity:** `O(1) routing intercept`
* **Space Complexity:** `O(1)`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
