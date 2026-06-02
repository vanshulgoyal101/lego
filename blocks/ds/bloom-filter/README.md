# Lego Block: `ds/bloom-filter`

A space-efficient probabilistic Bloom Filter membership tester.

> [!NOTE]
> **AI Agent Context:** Use this block when checking if values exist in large datasets without querying databases (e.g. username availability caching, blocking malicious URLs, duplicate key verification).

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add ds/bloom-filter
```

---

## API Specifications

### Parameters

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `size` | `number` | ⚠️ Yes | *-* | Array bit length allocation. |
| `hashFunctionsCount` | `number` | No | `3` | Total hashes to execute per item. |


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

* **Time Complexity:** `O(K) per add/test (K = hash function count)`
* **Space Complexity:** `O(M) bit array`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
