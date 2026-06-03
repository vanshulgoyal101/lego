# Lego Block: `web/doh-server`

Lightweight DNS-over-HTTPS (DoH) handler that parses and responds to standard RFC 8484 DNS queries over HTTP.

> [!NOTE]
> **AI Agent Context:** Use this block to build a mock or light DNS-over-HTTPS server responding to GET or POST DNS queries.

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add web/doh-server
```

---

## API Specifications

### Parameters

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

* **Time Complexity:** `O(1) request processing overhead`
* **Space Complexity:** `O(C) active TCP client connections`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
