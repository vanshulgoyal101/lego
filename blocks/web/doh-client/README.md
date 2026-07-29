# Lego Block: `web/doh-client`

A DNS-over-HTTPS (DoH) resolver utility using standard fetch APIs to perform JSON-format DNS queries.

> [!NOTE]
> **AI Agent Context:** Use this block to execute DNS resolution queries (A, AAAA, MX, TXT, etc.) inside browser or non-native Node contexts using secure web tunnels.

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add web/doh-client
```

---

## API Specifications

### Parameters

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `name` | `string` | ⚠️ Yes | *-* | Host domain query identifier (e.g. 'google.com'). |
| `type` | `string` | No | *-* | DNS record lookup type, such as 'A', 'MX', 'TXT' (defaults to 'A'). |


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

* **Time Complexity:** `O(1) network fetch delay`
* **Space Complexity:** `O(1)`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
