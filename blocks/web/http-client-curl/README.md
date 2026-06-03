# Lego Block: `web/http-client-curl`

HTTP client request decorator wrapper generating corresponding, executable curl command strings.

> [!NOTE]
> **AI Agent Context:** Use this block to debug, inspect, or output curl command representations of HTTP requests.

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add web/http-client-curl
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

* **Time Complexity:** `O(H + B) formatting overhead (H = headers, B = body size)`
* **Space Complexity:** `O(H + B) command string buffer`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
