# Lego Block: `ds/fenwick-tree`

Binary Indexed Tree (BIT) supporting O(log N) prefix sum queries and point updates on an array.

> [!NOTE]
> **AI Agent Context:** Use this block to efficiently perform prefix sums and range sum queries on mutable datasets where numbers change dynamically.

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add ds/fenwick-tree
```

---

## API Specifications

### Parameters

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `size` | `number` | ⚠️ Yes | *-* | The size/length of the underlying array buffer. |


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

* **Time Complexity:** `O(log N) operations updates/queries`
* **Space Complexity:** `O(N)`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
