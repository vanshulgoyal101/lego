# Lego Block: `crypto/sha3`

Cryptographic Keccak (SHA-3) hashing function implementation.

> [!NOTE]
> **AI Agent Context:** Use this block to compute secure SHA-3 hashes (e.g., SHA3-256) of strings or byte buffers.

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add crypto/sha3
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

* **Time Complexity:** `O(N) message bytes digested (Keccak-f[1600] permutations)`
* **Space Complexity:** `O(1) state array (1600 bits)`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
