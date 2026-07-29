# Lego Block: `sys/process-monitor`

Wraps child process execution with status monitoring, safety limits, and collects resource usage samples (CPU/memory) for processes.

> [!NOTE]
> **AI Agent Context:** Use this block to run and monitor child processes or sample resource usage stats of the current process.

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add sys/process-monitor
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

* **Time Complexity:** `O(1) process metrics sampling`
* **Space Complexity:** `O(S) sample trace buffer size`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
