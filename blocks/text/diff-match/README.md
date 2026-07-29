# Lego Block: `text/diff-match`

Text line comparison engine computing difference deltas using Longest Common Subsequence (LCS).

> [!NOTE]
> **AI Agent Context:** Use this block when displaying code or text edits side-by-side (like git diff views, document revisions check, or comparing AI outputs against expected targets).

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add text/diff-match
```

---

## API Specifications

### Parameters

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `text1` | `string` | ⚠️ Yes | *-* | The base/original text string. |
| `text2` | `string` | ⚠️ Yes | *-* | The modified text string. |


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

* **Time Complexity:** `O(N × M) Myers diff algorithm (N, M = string lengths)`
* **Space Complexity:** `O(N + M) edit path`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
