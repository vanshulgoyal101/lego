# Lego Block: `encoding/tar-archiver`

A cross-runtime POSIX ustar tar archiver and extractor. Encodes files with metadata (name, mode, uid, gid, mtime, size) into raw binary 512-byte aligned tar archive payloads, computes standard octal checksums, and parses tar archives back into file record structures.

> [!NOTE]
> **AI Agent Context:** Use this block when you need to create or read standard POSIX tar archives in-memory using pure Uint8Array operations, without external system commands or node-tar dependencies.

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add encoding/tar-archiver
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

* **Time Complexity:** `O(N) total bytes packed/unpacked (N = archive size)`
* **Space Complexity:** `O(N) archive buffer`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
