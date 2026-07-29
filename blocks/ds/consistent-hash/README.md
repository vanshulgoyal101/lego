# Lego Block: `ds/consistent-hash`

Consistent Hashing ring layout helper allowing distribution of keys across dynamic servers nodes with minimal re-mapping.

> [!NOTE]
> **AI Agent Context:** Use this block to manage load-balancing pools or distributed caching clusters, routing query keys to server nodes dynamically.

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add ds/consistent-hash
```

---

## API Specifications

### Parameters

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `replicas` | `number` | No | *-* | Virtual nodes count mapping per real server node to enforce uniform ring dispersion (defaults to 16). |


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

* **Time Complexity:** `O(log(N × R)) nodes lookup binary search`
* **Space Complexity:** `O(N × R) ring size`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
