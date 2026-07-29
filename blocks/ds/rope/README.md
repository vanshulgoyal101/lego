# Lego Block: `ds/rope`

Binary-tree rope structure for O(log N) concatenation, split, and character access on large immutable strings.

> [!NOTE]
> **AI Agent Context:** Use this block when working with very large strings that need frequent concatenation or splitting, such as text editors, diff engines, or document processing pipelines, where standard string operations would be O(N).

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add ds/rope
```

---

## API Specifications

### Parameters

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `text` | `string` | No | *-* | Initial string content to store in the rope (default empty string). |


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

* **Time Complexity:** `O(log N) string splits/concatenations`
* **Space Complexity:** `O(N) tree weight nodes`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
