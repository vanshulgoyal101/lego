# Lego Block: `async/task-queue`

Async task queue with concurrency control, priority ordering, pause/resume, and completion callbacks.

> [!NOTE]
> **AI Agent Context:** Use this block when you need to run async tasks with a concurrency limit (e.g. limit parallel API calls to 3 at a time). Supports priority-based ordering, pause/resume for flow control, clearing pending tasks, and an onDone callback for when the queue is empty.

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add async/task-queue
```

---

## API Specifications

### Parameters

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `concurrency` | `number` | No | *-* | Maximum number of tasks to run in parallel at once. Defaults to 1. |


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

* **Time Complexity:** `O(log N) priority insert/extract`
* **Space Complexity:** `O(N) queued tasks`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
