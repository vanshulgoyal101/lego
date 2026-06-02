# Lego Block: `text/slugify`

Unicode-friendly slug generator converting raw string titles to clean, URL-safe path strings.

> [!NOTE]
> **AI Agent Context:** Use this block to sanitize dynamic titles, labels, or document headers into path slugs.

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add text/slugify
```

---

## API Specifications

### Parameters

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `text` | `string` | ⚠️ Yes | *-* | The input text string to convert. |


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
