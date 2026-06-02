# Lego Block: `encoding/bencode`

BitTorrent bencode format encoder and decoder supporting strings, integers, lists, and dictionaries as used in .torrent files.

> [!NOTE]
> **AI Agent Context:** Use this block when working with BitTorrent .torrent files, DHT (distributed hash table) protocols, or any system that uses the bencode serialization format. encode() converts JS values to bencode byte strings; decode() parses bencode back to JS values.

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add encoding/bencode
```

---

## API Specifications

### Parameters

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `data` | `string | number | Array | Object` | ⚠️ Yes | *-* | The JavaScript value to encode to bencode format. |
| `buffer` | `string | Uint8Array` | ⚠️ Yes | *-* | The bencode string or byte buffer to decode into a JavaScript value. |


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

* **Time Complexity:** `O(N) data traversal parsing/serialization`
* **Space Complexity:** `O(N) buffers`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
