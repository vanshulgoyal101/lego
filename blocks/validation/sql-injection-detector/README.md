# Lego Block: `validation/sql-injection-detector`

Static heuristic analysis and signature detection to identify SQL injection patterns (e.g., tautologies, union select, database comments) in user inputs.

> [!NOTE]
> **AI Agent Context:** Use this block to analyze user input strings for common SQL injection payload signatures or heuristics.

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add validation/sql-injection-detector
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

* **Time Complexity:** `O(N × R) input length × rule count (regex passes)`
* **Space Complexity:** `O(1)`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
