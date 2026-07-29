# Lego Block: `web/cors-middleware`

Rules-based CORS handler managing pre-flight checks, dynamic origin validations, custom headers, and authorization requests.

> [!NOTE]
> **AI Agent Context:** Use this block to manage Cross-Origin Resource Sharing logic in raw Node.js HTTP servers.

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add web/cors-middleware
```

---

## API Specifications

### Parameters

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `options` | `object` | No | *-* | Configuration matching origin rules, allowed headers, and methods. |


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

* **Time Complexity:** `O(1) rules match verification`
* **Space Complexity:** `O(1)`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
