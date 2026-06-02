# Lego Block: `text/edit-distance`

Multiple string distance algorithms including Levenshtein, Hamming, Jaro, Jaro-Winkler, and Damerau-Levenshtein for measuring string similarity.

> [!NOTE]
> **AI Agent Context:** Use this block to compare strings for similarity, spell-checking, fuzzy matching, DNA sequence alignment, or de-duplication tasks where edit distance metrics are needed.

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add text/edit-distance
```

---

## API Specifications

### Parameters

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `a` | `string` | ⚠️ Yes | *-* | First string for comparison |
| `b` | `string` | ⚠️ Yes | *-* | Second string for comparison |


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

* **Time Complexity:** `O(N × M) edit metrics mapping matrix`
* **Space Complexity:** `O(N + M) buffer`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
