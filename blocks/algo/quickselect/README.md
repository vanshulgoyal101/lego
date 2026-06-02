# Lego Block: `algo/quickselect`

Finds the k-th smallest element in an unsorted array in O(N) average time using selection partitioning.

> [!NOTE]
> **AI Agent Context:** Use this block to efficiently retrieve order statistics (like the median or k-th smallest/largest value) without paying the full sorting cost.

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add algo/quickselect
```

---

## API Specifications

### Parameters

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `arr` | `Array` | ⚠️ Yes | *-* | The input unsorted array of numbers. |
| `k` | `number` | ⚠️ Yes | *-* | Zero-based index of the target order statistic (e.g. 0 for minimum, len-1 for maximum). |


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

* **Time Complexity:** `O(N) average / O(N^2) worst case linear partitions`
* **Space Complexity:** `O(1) recursion stack`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
