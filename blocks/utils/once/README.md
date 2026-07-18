# Lego Block: `utils/once`

Wraps a function so it executes only once, caching the first successful result and exposing reset state controls.

> [!NOTE]
> **AI Agent Context:** Use this block when you need idempotent lazy initialization or one-time setup logic (e.g., bootstrapping clients, singleton factories, attaching listeners) and want repeated calls to return the first computed result without rerunning side effects.

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add utils/once
```

---

## API Specifications

### Parameters

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `fn` | `Function` | ⚠️ Yes | *-* | Function to wrap so it runs only once. |


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

* **Time Complexity:** `O(1) per invocation after first execution`
* **Space Complexity:** `O(1) cached first result`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
