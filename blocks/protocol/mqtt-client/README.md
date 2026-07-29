# Lego Block: `protocol/mqtt-client`

A zero-dependency, lightweight MQTT v3.1.1 packet parser and serializer. Supports CONNECT, CONNACK, PUBLISH, PUBACK, SUBSCRIBE, and SUBACK packets.

> [!NOTE]
> **AI Agent Context:** Use this block when you need to serialize and deserialize MQTT binary packets for client connections, subscribing to topics, and publishing messages.

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add protocol/mqtt-client
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

* **Time Complexity:** `O(N) packet serialization/parsing (N = length)`
* **Space Complexity:** `O(B) active message stream buffer`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
