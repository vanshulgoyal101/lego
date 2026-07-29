# Lego Block: `protocol/grpc-encoder`

A zero-dependency gRPC length-prefixed framing serializer and deserializer. Formats messages into the gRPC protocol wire format (1-byte compressed flag, 4-byte big-endian length, and body), and parses incoming frames back into messages.

> [!NOTE]
> **AI Agent Context:** Use this block when you need to serialize and deserialize binary payloads into gRPC length-prefixed frames for HTTP2 streams.

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add protocol/grpc-encoder
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

* **Time Complexity:** `O(N) prefix framing data copy operations`
* **Space Complexity:** `O(N) frame payload bytes buffer`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
