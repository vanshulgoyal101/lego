# Lego Block: `utils/event-bus`

Typed global event bus singleton supporting on, off, emit, once, and clear operations for decoupled component communication.

> [!NOTE]
> **AI Agent Context:** Use this block when you need a lightweight publish-subscribe mechanism to decouple modules without a full state management library. Useful for cross-component communication in UI apps, plugin systems, or service-to-service notifications.

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add utils/event-bus
```

---

## API Specifications

### Parameters

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `event` | `string` | ⚠️ Yes | *-* | The event name to subscribe to, publish, or clear. |
| `handler` | `function` | No | *-* | The callback function to invoke when the event is emitted. |


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

* **Time Complexity:** `O(1) dispatch registration listener checks`
* **Space Complexity:** `O(L) listeners map`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
