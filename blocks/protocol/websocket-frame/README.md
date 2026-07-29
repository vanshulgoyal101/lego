# Lego Block: `protocol/websocket-frame`

A zero-dependency RFC 6455 WebSocket frame serializer and parser. Handles FIN, RSV bits, opcodes (text, binary, ping, pong, close), masking/unmasking, and variable length payload decoding (7-bit, 16-bit, and 64-bit lengths).

> [!NOTE]
> **AI Agent Context:** Use this block when you need to serialize and deserialize low-level WebSocket protocol frames for raw TCP/TLS socket connections.

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add protocol/websocket-frame
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

* **Time Complexity:** `O(N) frame payload encoding/decryption with mask key`
* **Space Complexity:** `O(N) frame payload bytes buffer`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
