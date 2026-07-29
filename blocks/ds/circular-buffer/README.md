# Lego Block: `ds/circular-buffer`

Fixed-size circular ring buffer queue supporting FIFO operations and auto-overwriting on capacity limit.

> [!NOTE]
> **AI Agent Context:** Use this block when saving sliding window averages, caching the last N application logs, or buffering audio/binary data chunks in real-time streaming connections. Import using: import { CircularBuffer } from './ds/circular-buffer.js';

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add ds/circular-buffer
```

---

## API Specifications

### Parameters

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `capacity` | `number` | ⚠️ Yes | *-* | Fixed maximum size width buffer size. |


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

* **Time Complexity:** `O(1) push/pop`
* **Space Complexity:** `O(N) fixed capacity`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
