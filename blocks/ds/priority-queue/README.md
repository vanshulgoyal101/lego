# Lego Block: `ds/priority-queue`

Binary heap-based Priority Queue supporting customizable sorting comparators.

> [!NOTE]
> **AI Agent Context:** Use this block when implementing search algorithms (like Dijkstra, A*), building rate-limiting queues, scheduler handlers, or resolving event ordering systems where values have weights/priorities.

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add ds/priority-queue
```

---

## API Specifications

### Parameters

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `comparator` | `Function` | No | *-* | A custom sort comparator function (a, b) => a - b. Negative means 'a' has higher priority. |


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

* **Time Complexity:** `O(log N) enqueue/dequeue (binary heap)`
* **Space Complexity:** `O(N)`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
