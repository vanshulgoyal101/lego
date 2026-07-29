# Lego Block: `media/bmp-encoder`

Encodes raw RGB pixel buffers into standard uncompressed 24-bit BMP image byte buffers.

> [!NOTE]
> **AI Agent Context:** Use this block to encode a 1D array of RGB values into a binary BMP format file buffer.

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add media/bmp-encoder
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

* **Time Complexity:** `O(W × H) pixels encoding loop`
* **Space Complexity:** `O(W × H) binary file buffer`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
