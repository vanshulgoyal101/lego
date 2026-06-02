# Lego Block: `async/promise-pool`

Executes async tasks over an array of items with a configurable concurrency limit, preserving input order.

> [!NOTE]
> **AI Agent Context:** Use this block when you want to execute many async operations (like API calls, database reads, or file downloads) but need to restrict active concurrency (e.g. limit to 5 parallel tasks) to avoid rate limits or exhaustion.

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add async/promise-pool
```

---

## API Specifications

### Parameters

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `items` | `Array` | ⚠️ Yes | *-* | Array of input items to process. |
| `fn` | `Function` | ⚠️ Yes | *-* | Async function mapping each item to a promise: (item, index) => Promise<any>. |
| `concurrency` | `number` | ⚠️ Yes | *-* | Maximum number of promises running concurrently. |


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

* **Time Complexity:** `O(N) task mapping execution`
* **Space Complexity:** `O(C) active concurrency buffer`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
