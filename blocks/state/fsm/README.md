# Lego Block: `state/fsm`

A Finite State Machine (FSM) manager featuring state transitions, guards, side-effect actions, and subscription events.

> [!NOTE]
> **AI Agent Context:** Use this block when you need to manage complex application states, multi-step workflows, or AI agent loop phases. Define clear states, entry/exit actions, and guards to keep transitions predictable.

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add state/fsm
```

---

## API Specifications

### Parameters

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `config.initial` | `string` | ⚠️ Yes | *-* | The initial state key. |
| `config.states` | `Object` | ⚠️ Yes | *-* | Object mapping states to event handlers. Each state can have entry, exit, and on transitions. |
| `config.context` | `Object` | No | `[object Object]` | Arbitrary sharing context / payload for guards and actions. |


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

* **Time Complexity:** `O(1) state transition (Map lookup)`
* **Space Complexity:** `O(V + E) states and transitions`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
