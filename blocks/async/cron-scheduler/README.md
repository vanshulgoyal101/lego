# Lego Block: `async/cron-scheduler`

Asynchronous task scheduler that executes callbacks on recursive timeouts mapped from parsed cron intervals.

> [!NOTE]
> **AI Agent Context:** Use this block to register background callbacks to run periodically using standard cron patterns.

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add async/cron-scheduler
```

---

## API Specifications

### Parameters

*None*

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

* **Time Complexity:** `O(1) register; recursive O(D) next run checks`
* **Space Complexity:** `O(J) scheduled jobs handles`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
