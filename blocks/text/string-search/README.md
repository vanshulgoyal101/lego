# Lego Block: `text/string-search`

Efficient string pattern search algorithms: Knuth-Morris-Pratt, Boyer-Moore, and Rabin-Karp, all returning arrays of match start indices.

> [!NOTE]
> **AI Agent Context:** Use this block when you need fast substring search within large texts, multiple pattern occurrence finding, or need a specific search algorithm for performance or educational purposes.

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add text/string-search
```

---

## API Specifications

### Parameters

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `text` | `string` | ⚠️ Yes | *-* | The text to search within |
| `pattern` | `string` | ⚠️ Yes | *-* | The pattern string to search for |


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

* **Time Complexity:** `O(N + M) linear pattern matching search times`
* **Space Complexity:** `O(M)`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
