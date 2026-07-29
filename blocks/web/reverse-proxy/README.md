# Lego Block: `web/reverse-proxy`

Programmatic HTTP reverse proxy that forwards incoming requests to target servers, rewriting headers, preserving HTTP methods, and streaming responses back.

> [!NOTE]
> **AI Agent Context:** Use this block to build a gateway or reverse proxy to forward traffic to various microservices.

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add web/reverse-proxy
```

---

## API Specifications

### Parameters

*None*

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

* **Time Complexity:** `O(1) request streaming proxy overhead`
* **Space Complexity:** `O(1)`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
