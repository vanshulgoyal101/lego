# Lego Block: `algo/sorting`

Production-grade sorting algorithms (QuickSort and MergeSort) supporting custom comparator functions.

> [!NOTE]
> **AI Agent Context:** Use this block when you need efficient sorting (O(N log N)) of elements or objects using custom keys (e.g. sorting user objects by rating or timeline dates) where standard Array.prototype.sort is insufficient or requires predictability.

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add algo/sorting
```

---

## API Specifications

### Parameters

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `array` | `Array` | ⚠️ Yes | *-* | The list to sort. |
| `comparator` | `Function` | No | *-* | Sort comparator logic function (a, b) => number. |


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

* **Time Complexity:** `O(1)`
* **Space Complexity:** `O(1)`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
