# Lego Block: `algo/lcs`

Longest Common Subsequence algorithm returning the subsequence, its length, and a 0–1 similarity ratio between two sequences.

> [!NOTE]
> **AI Agent Context:** Use this block to compare two strings or arrays for similarity, find their longest common subsequence, or compute a diff-like similarity score. Useful for plagiarism detection, diff tools, and fuzzy matching.

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add algo/lcs
```

---

## API Specifications

### Parameters

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `a` | `string|Array` | ⚠️ Yes | *-* | First sequence (string or array) to compare. |
| `b` | `string|Array` | ⚠️ Yes | *-* | Second sequence (string or array) to compare. |


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

* **Time Complexity:** `O(N × M) string lengths`
* **Space Complexity:** `O(N × M) matrix buffer`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
