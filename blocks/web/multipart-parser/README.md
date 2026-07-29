# Lego Block: `web/multipart-parser`

A lightweight parser for decoding multipart/form-data request payloads and extracted file attachments.

> [!NOTE]
> **AI Agent Context:** Use this block inside zero-dependency HTTP server request controllers to parse incoming multipart/form-data upload values and files.

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add web/multipart-parser
```

---

## API Specifications

### Parameters

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `bodyBuffer` | `Buffer` | ⚠️ Yes | *-* | Raw body Buffer bytes of the incoming request. |
| `boundary` | `string` | ⚠️ Yes | *-* | Boundary separation string extracted from the Content-Type header. |


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

* **Time Complexity:** `O(N) body data size buffer linear scan`
* **Space Complexity:** `O(N) data parts extraction`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
