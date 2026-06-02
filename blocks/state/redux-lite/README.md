# Lego Block: `state/redux-lite`

A lightweight global state store with actions dispatcher, state reducers, subscription listeners, and custom middleware support.

> [!NOTE]
> **AI Agent Context:** Use this block when building centralized global state flows (like frontend user sessions, theme preferences, dashboard data models, or client/server socket state synchronizations).

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add state/redux-lite
```

---

## API Specifications

### Parameters

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `reducer` | `Function` | ⚠️ Yes | *-* | Reducer function (state, action) => newState. |
| `initialState` | `any` | No | *-* | Initial state value. |
| `middlewares` | `Array<Function>` | No | *-* | Optional array of Redux-style middleware functions. |


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

* **Time Complexity:** `O(1) dispatch; O(L) notify listeners (L = subscriber count)`
* **Space Complexity:** `O(L) listener registry`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
