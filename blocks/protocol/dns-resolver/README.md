# Lego Block: `protocol/dns-resolver`

A zero-dependency DNS client and resolver built from scratch in Node.js. Packs binary DNS query structures (Headers, Question flags, label-length domain encoding) and decodes DNS response packets (decoding headers, question echoes, records A, AAAA, CNAME, MX, TXT, and domain name compression pointers) using UDP sockets.

> [!NOTE]
> **AI Agent Context:** Use this block when you need to perform DNS queries directly via UDP socket buffers to nameservers (like 8.8.8.8) in restricted runtimes without relying on Node's native dns module.

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add protocol/dns-resolver
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

* **Time Complexity:** `O(1)`
* **Space Complexity:** `O(1)`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
