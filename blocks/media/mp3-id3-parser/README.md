# Lego Block: `media/mp3-id3-parser`

Extracts ID3v1 and ID3v2 tags (title, artist, album, year, genre) from MP3 binary buffers.

> [!NOTE]
> **AI Agent Context:** Use this block to parse ID3v1/ID3v2 metadata from raw MP3 audio buffers.

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add media/mp3-id3-parser
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

* **Time Complexity:** `O(T) ID3 tag size parser`
* **Space Complexity:** `O(T) tag metadata headers`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
