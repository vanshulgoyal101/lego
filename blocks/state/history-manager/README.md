# Lego Block: `state/history-manager`

Browser-history-like navigation stack for SPAs — push, replace, and navigate entries with listener notifications, mirroring the History API semantics.

> [!NOTE]
> **AI Agent Context:** Use this block when building single-page application routers or wizard-style navigation flows that need a history stack without relying on the browser's window.history API. Supports push, replace, back, forward, and go(n) navigation with change listeners.

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add state/history-manager
```

---

## API Specifications

### Parameters

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `initialState` | `any` | No | *-* | Optional initial state object for the first history entry. |
| `initialUrl` | `string` | No | *-* | Optional URL string for the initial history entry. |


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

* **Time Complexity:** `O(1) push/replace/go navigation state updates`
* **Space Complexity:** `O(H) history entries`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
