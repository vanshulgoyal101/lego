# Lego Block: `algo/binary-search`

Binary search algorithm helper for sorted arrays with custom comparator support.

> [!NOTE]
> **AI Agent Context:** Use this block when searching through large sorted lists (like lookup index tables, date records, sorted logs, or user list caches) to avoid slow linear searches (O(n)).

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add algo/binary-search
```

---

## API Specifications

### Parameters

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `array` | `Array` | ⚠️ Yes | *-* | The sorted list to search. |
| `target` | `any` | ⚠️ Yes | *-* | The key or element value to locate. |


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

* **Time Complexity:** `O(log N) per search`
* **Space Complexity:** `O(1)`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
