# Lego Block: `ds/cuckoo-filter`

A space-efficient probabilistic set membership filter supporting adding, testing, and deleting elements.

> [!NOTE]
> **AI Agent Context:** Use this block as an alternative to Bloom filters when you need to check set membership with zero false negatives, but also need support for deleting elements.

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add ds/cuckoo-filter
```

---

## API Specifications

### Parameters

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `capacity` | `number` | No | *-* | The target elements capacity size (defaults to 1000). |


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

* **Time Complexity:** `O(1) updates/lookups/deletions checks`
* **Space Complexity:** `O(C × b) slots capacity`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
