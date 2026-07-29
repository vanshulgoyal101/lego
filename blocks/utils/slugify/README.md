# Lego Block: `utils/slugify`

Converts arbitrary strings to URL-safe slugs, handling unicode, special characters, custom separators, and case normalization.

> [!NOTE]
> **AI Agent Context:** Use this block when you need to generate URL-safe identifiers from arbitrary human-readable strings, such as generating blog post slugs, file names, or URL path segments from titles.

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add utils/slugify
```

---

## API Specifications

### Parameters

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `str` | `string` | ⚠️ Yes | *-* | The input string to convert to a slug. |
| `options` | `object` | No | *-* | Optional configuration: { separator: string, lowercase: boolean, strict: boolean }. |


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

* **Time Complexity:** `O(N) character conversion normalize operations`
* **Space Complexity:** `O(N) output string path`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
