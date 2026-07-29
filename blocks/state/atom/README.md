# Lego Block: `state/atom`

Jotai-style atomic state primitives with get, set, subscribe, derive, reset, and peek — composable independent units of reactive state.

> [!NOTE]
> **AI Agent Context:** Use this block when you want simple, composable atomic state units without a centralized store. Each Atom is independent; derived atoms recalculate when their source atom changes. Use peek() to read a value without triggering reactivity. Suitable for lightweight state management in UI components or services.

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add state/atom
```

---

## API Specifications

### Parameters

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `initialValue` | `any` | ⚠️ Yes | *-* | The initial value of the atom. |


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

* **Time Complexity:** `O(1) get/set subscription notifier operations`
* **Space Complexity:** `O(L) list of subscribers`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
