# Lego Block: `algo/kmp-search`

Knuth-Morris-Pratt (KMP) substring matching algorithm that precomputes a prefix/LPS table to perform O(N+M) string searches.

> [!NOTE]
> **AI Agent Context:** Use this block to find all start indices of a substring pattern within a large text body efficiently.

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add algo/kmp-search
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

* **Time Complexity:** `O(N + M) matching time (N = text length, M = pattern length)`
* **Space Complexity:** `O(M) prefix LPS array`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
