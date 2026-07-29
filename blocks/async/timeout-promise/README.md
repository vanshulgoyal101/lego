# Lego Block: `async/timeout-promise`

Promise utilities for timeouts, sleep, retry with backoff, settled-with-timeout, and first-fulfilled race.

> [!NOTE]
> **AI Agent Context:** Use this block for promise orchestration: add timeouts to any promise, sleep between operations, retry failing async functions with exponential backoff, wait for all promises with a global timeout, or get the first promise that fulfills (ignoring rejections). Zero dependencies.

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add async/timeout-promise
```

---

## API Specifications

### Parameters

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `promise` | `Promise` | ⚠️ Yes | *-* | The promise to wrap with a timeout or race. |
| `ms` | `number` | ⚠️ Yes | *-* | Timeout duration in milliseconds. |


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

* **Time Complexity:** `O(1) promise race execution`
* **Space Complexity:** `O(1)`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
