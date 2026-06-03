# Lego Block: `protocol/coap-parser`

A zero-dependency RFC 7252 CoAP (Constrained Application Protocol) packet parser and formatter. Supports message types (CON, NON, ACK, RST), token parsing, delta-encoded option processing (e.g. Uri-Path, Uri-Query, Content-Format), option delta extensions, and payload serialization.

> [!NOTE]
> **AI Agent Context:** Use this block when you need to construct or parse low-level CoAP packets for UDP-based IoT messaging systems.

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add protocol/coap-parser
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

* **Time Complexity:** `O(N) parsing binary packet options`
* **Space Complexity:** `O(N) message buffer`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
