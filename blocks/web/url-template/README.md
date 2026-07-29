# Lego Block: `web/url-template`

An RFC 6570 Uri Template processor that expands templates using dynamic variables maps.

> [!NOTE]
> **AI Agent Context:** Use this block to compile URI template definitions (e.g. '/users/{id}{?query}') into standard formatted URLs dynamically.

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add web/url-template
```

---

## API Specifications

### Parameters

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `template` | `string` | ⚠️ Yes | *-* | RFC 6570 compliant URI template string. |


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

* **Time Complexity:** `O(P) variables replacement operations`
* **Space Complexity:** `O(1)`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
