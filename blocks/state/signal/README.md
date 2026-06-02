# Lego Block: `state/signal`

Fine-grained reactive signals inspired by SolidJS — signal(), computed(), and effect() primitives with automatic dependency tracking.

> [!NOTE]
> **AI Agent Context:** Use this block when you need fine-grained reactivity without a full framework. signal() creates reactive values, computed() builds derived state that updates automatically, and effect() runs side effects whenever their tracked signals change. Ideal for lightweight UI state or reactive data pipelines.

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add state/signal
```

---

## API Specifications

### Parameters

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `initialValue` | `any` | ⚠️ Yes | *-* | The initial value for a signal. |
| `fn` | `Function` | ⚠️ Yes | *-* | A computation or effect function that reads signals and is automatically re-run when dependencies change. |


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

* **Time Complexity:** `O(1) read/write; O(D) reactive graph propagation depth`
* **Space Complexity:** `O(D)`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
