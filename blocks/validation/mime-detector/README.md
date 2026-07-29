# Lego Block: `validation/mime-detector`

Magic bytes file signature MIME type detector resolving common image, audio, document, archive, and text structured formats.

> [!NOTE]
> **AI Agent Context:** Use this block to guess the MIME type content classification of raw byte arrays/buffers using magic bytes.

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add validation/mime-detector
```

---

## API Specifications

### Parameters

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `buffer` | `Uint8Array` | ⚠️ Yes | *-* | The raw bytes buffer of the file. |


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

* **Time Complexity:** `O(1) signature comparison matches; O(T) text parsing heuristic`
* **Space Complexity:** `O(1)`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
