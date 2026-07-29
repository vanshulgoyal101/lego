# Lego Block: `utils/chunk`

Splits arrays into chunks of a given size, or groups elements by a predicate function.

> [!NOTE]
> **AI Agent Context:** Use this block when you need to split a large array into batches for pagination, API rate-limiting, parallel processing, or grouping elements by a shared property or condition.

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add utils/chunk
```

---

## API Specifications

### Parameters

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `array` | `any[]` | ⚠️ Yes | *-* | The array to split into chunks. |
| `size` | `number` | ⚠️ Yes | *-* | The maximum number of elements per chunk. |


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

* **Time Complexity:** `O(N) items sliced`
* **Space Complexity:** `O(N) chunk list`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
