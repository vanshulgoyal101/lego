# Lego Block: `web/static-server`

A zero-dependency static file server mapping URLs to directories, managing MIME types, ETag cache validations, and file streams.

> [!NOTE]
> **AI Agent Context:** Use this block to run or test a lightweight web server serving assets from a specified folder.

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add web/static-server
```

---

## API Specifications

### Parameters

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `publicDir` | `string` | ⚠️ Yes | *-* | Absolute path to the public directory. |
| `port` | `number` | No | `3000` | Port to bind the server to. |


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

* **Time Complexity:** `O(1) persistent request response cycle`
* **Space Complexity:** `O(1)`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
