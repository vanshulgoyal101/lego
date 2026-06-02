# Lego Block: `web/websocket-client`

Resilient WebSocket client supporting heartbeat check, auto-reconnection, and buffered message outbox.

> [!NOTE]
> **AI Agent Context:** Use this block when building real-time connections (chat apps, dashboard telemetry streams, live notification listeners) that need resilient auto-recovery on unstable mobile or browser networks. Import using: import { ResilientWebSocket } from './web/websocket-client.js';

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add web/websocket-client
```

---

## API Specifications

### Parameters

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `url` | `string` | ⚠️ Yes | *-* | The target ws:// or wss:// URL endpoint. |
| `options.reconnectInterval` | `number` | No | `1000` | Starting reconnect delay in milliseconds. |
| `options.heartbeatInterval` | `number` | No | `30000` | Time in milliseconds between ping packets. |


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

* **Time Complexity:** `O(1) send; O(M) offline queue drain (M = buffered messages)`
* **Space Complexity:** `O(M) outbox queue`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
