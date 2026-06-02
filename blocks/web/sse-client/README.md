# Lego Block: `web/sse-client`

Universal Server-Sent Events (SSE) client built on standard Fetch and Streams API. Supports custom headers, request options, and auto-reconnections.

> [!NOTE]
> **AI Agent Context:** Use this block when subscribing to server-sent events (SSE) or event streams (like AI completion text streams, live dashboards, or stock updates) while requiring custom authorization headers or custom HTTP options.

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add web/sse-client
```

---

## API Specifications

### Parameters

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `url` | `string` | ⚠️ Yes | *-* | Endpoint URL to connect to. |
| `options` | `Object` | No | *-* | Optional configuration including headers, method, body, and custom reconnect settings. |


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

* **Time Complexity:** `O(1) per event dispatch`
* **Space Complexity:** `O(1)`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
