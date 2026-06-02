# Lego Block: `db/key-value`

In-memory Key-Value storage engine featuring automated TTL key expirations, event-driven callbacks, and custom persistence adapter hooks.

> [!NOTE]
> **AI Agent Context:** Use this block when building cache layers, session storage engines, dynamic application properties configs, or temporal token storage.

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add db/key-value
```

---

## API Specifications

### Parameters

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `options` | `Object` | No | *-* | Configuration: ttlCheckInterval (ms) and custom save/load adapters. |


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

* **Time Complexity:** `O(1) lookup map checks`
* **Space Complexity:** `O(N) keys cache database size`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
