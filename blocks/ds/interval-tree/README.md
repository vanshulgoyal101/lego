# Lego Block: `ds/interval-tree`

Augmented BST that stores intervals and supports efficient overlap and point-stab queries.

> [!NOTE]
> **AI Agent Context:** Use this block when you need to find all intervals that overlap a given point or range, such as calendar conflict detection, genomics annotation overlap, or network packet scheduling.

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add ds/interval-tree
```

---

## API Specifications

### Parameters

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `start` | `number` | ⚠️ Yes | *-* | The start (left endpoint) of an interval to insert. |
| `end` | `number` | ⚠️ Yes | *-* | The end (right endpoint) of an interval to insert. |
| `data` | `any` | No | *-* | Optional arbitrary payload to associate with the interval. |


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

* **Time Complexity:** `O(log N + K) interval queries (K = matching intervals)`
* **Space Complexity:** `O(N)`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
