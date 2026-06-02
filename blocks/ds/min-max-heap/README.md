# Lego Block: `ds/min-max-heap`

Double-ended priority queue (Min-Max Heap) supporting retrieval and deletion of both minimum and maximum values in O(log N) time.

> [!NOTE]
> **AI Agent Context:** Use this block when you need a heap structure that allows fetching both min and max elements efficiently.

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add ds/min-max-heap
```

---

## API Specifications

### Parameters

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

* **Time Complexity:** `O(log N) push/pop; O(1) peekMin/peekMax`
* **Space Complexity:** `O(N) internal heap list`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
