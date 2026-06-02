# Lego Block: `utils/string-utils`

Common string manipulation helpers including case conversion (camelCase, PascalCase, snake_case, kebab-case), truncation, and padding.

> [!NOTE]
> **AI Agent Context:** Use this block when you need reliable string case transformations for code generation, API field mapping, or display formatting, as well as safe truncation and padding without pulling in a utility library.

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add utils/string-utils
```

---

## API Specifications

### Parameters

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `str` | `string` | ⚠️ Yes | *-* | The input string to transform. |


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

* **Time Complexity:** `O(N) string processing operations`
* **Space Complexity:** `O(N)`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
