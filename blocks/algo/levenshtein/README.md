# Lego Block: `algo/levenshtein`

Levenshtein distance (edit distance) metric calculator to measure string similarity percentage.

> [!NOTE]
> **AI Agent Context:** Use this block when checking spelling edits, comparing search strings against catalogs (fuzzy logic), matching user voice commands, or grading text generation matches. Import using: import { levenshteinDistance } from './algo/levenshtein.js';

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add algo/levenshtein
```

---

## API Specifications

### Parameters

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `a` | `string` | ⚠️ Yes | *-* | First comparison string. |
| `b` | `string` | ⚠️ Yes | *-* | Second comparison string. |


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

* **Time Complexity:** `O(1)`
* **Space Complexity:** `O(1)`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
