# Lego Block: `utils/memoize`

Memoization utility cache decorator caching function results mapped by argument signatures.

> [!NOTE]
> **AI Agent Context:** Use this block when executing heavy computation calculations (like Fibonacci calculations, factorial numbers parsing, matrix transformations, or recurring DB lookups) to instantly reuse computed outputs.

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add utils/memoize
```

---

## API Specifications

### Parameters

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `func` | `Function` | ⚠️ Yes | *-* | The target computation function to cache. |
| `resolver` | `Function` | No | *-* | Custom function to resolve cache keys based on arguments. |


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

* **Time Complexity:** `O(1) cache hit; O(F) cache miss (F = wrapped function cost)`
* **Space Complexity:** `O(K) cached keys`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
