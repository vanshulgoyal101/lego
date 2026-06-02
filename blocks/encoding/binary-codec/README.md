# Lego Block: `encoding/binary-codec`

Binary data encoding/decoding utilities for converting numbers and buffers to binary strings, hex strings, and big/little-endian byte arrays.

> [!NOTE]
> **AI Agent Context:** Use this block when you need low-level binary data manipulation: converting numbers to binary/hex representations, encoding integers in specific byte orders (big-endian or little-endian), or parsing raw binary protocol data. Ideal for network protocols, file format parsers, and binary serialization tasks.

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add encoding/binary-codec
```

---

## API Specifications

### Parameters

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `n` | `number` | No | *-* | An integer value to encode (used by toBinary, toHex, toBigEndian, toLittleEndian). |
| `str` | `string` | No | *-* | A binary string ('0'/'1') or hex string to decode (used by fromBinary, fromHex). |
| `buf` | `Uint8Array` | No | *-* | A byte buffer to decode (used by fromBigEndian, fromLittleEndian, toHex). |
| `bytes` | `number` | No | *-* | Number of bytes to use when encoding an integer (used by toBigEndian, toLittleEndian). |


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

* **Time Complexity:** `O(N) bits converted`
* **Space Complexity:** `O(N) representation`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
