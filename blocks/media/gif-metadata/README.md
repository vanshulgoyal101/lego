# Lego Block: `media/gif-metadata`

Parses Logical Screen Descriptor (width, height, background color index), Global Color Table metadata, and image frames descriptor / delay times from GIF binary buffers.

> [!NOTE]
> **AI Agent Context:** Use this block to parse GIF headers, Global Color Table metadata, and frame delay/dimensions from raw GIF buffers.

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add media/gif-metadata
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

* **Time Complexity:** `O(F) frame block scan`
* **Space Complexity:** `O(F) frame descriptor properties`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
