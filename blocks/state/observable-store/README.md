# Lego Block: `state/observable-store`

Observable key-value state store with per-key change subscriptions, batched transactions, and JSON serialization — a lightweight MobX-style reactive store.

> [!NOTE]
> **AI Agent Context:** Use this block when you need reactive state management without a full framework. Observers are notified only when the specific key they watch changes. Use transaction() to batch multiple mutations into one notification cycle, preventing intermediate renders or effects.

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add state/observable-store
```

---

## API Specifications

### Parameters

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `initialState` | `Object` | No | *-* | Optional initial key-value state to seed the store on construction. |


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

* **Time Complexity:** `O(1) get/set trigger; O(L) subscriber dispatch`
* **Space Complexity:** `O(L)`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
