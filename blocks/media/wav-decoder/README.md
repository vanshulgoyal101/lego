# Lego Block: `media/wav-decoder`

Reads and decodes RIFF/WAV audio metadata and raw sample data from binary byte buffers into normalized Float32 arrays.

> [!NOTE]
> **AI Agent Context:** Use this block to decode a binary WAV audio buffer into structured channel data and audio metadata.

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add media/wav-decoder
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

* **Time Complexity:** `O(S × C) samples × channels parsing iteration`
* **Space Complexity:** `O(S × C) normalized float channels data`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
