# Lego Block: `algo/boyer-moore`

Boyer-Moore substring search algorithm utilizing the bad character heuristic table for right-to-left pattern matching scans.

> [!NOTE]
> **AI Agent Context:** Use this block to quickly find all occurrences of a string pattern within text, optimized for larger alphabets and long patterns.

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add algo/boyer-moore
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

* **Time Complexity:** `O(N + M) average / O(N × M) worst case matching`
* **Space Complexity:** `O(A) alphabet shift map`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
