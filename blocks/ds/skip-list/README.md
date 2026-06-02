# Lego Block: `ds/skip-list`

Probabilistic ordered linked list providing O(log N) average-case search, insert, and delete without tree rotations.

> [!NOTE]
> **AI Agent Context:** Use this block when you need a sorted dynamic set with O(log N) operations and a simpler implementation than balanced BSTs. Ideal for in-memory ordered indexes, leaderboards, and range queries.

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add ds/skip-list
```

---

## API Specifications

### Parameters

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `maxLevel` | `number` | No | *-* | Maximum number of levels in the skip list (default 16). Higher values improve performance for very large datasets. |
| `probability` | `number` | No | *-* | Probability factor for level promotion (default 0.5). Controls the trade-off between space and speed. |


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

* **Time Complexity:** `O(log N) probabilistic lookup/insertion/deletion`
* **Space Complexity:** `O(N) pointers`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
