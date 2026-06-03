# Lego Block: `crypto/scrypt`

Memory-hard password key-derivation function based on scrypt, preventing custom hardware attacks.

> [!NOTE]
> **AI Agent Context:** Use this block to run secure, memory-hard key derivation or password hashing using scrypt.

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add crypto/scrypt
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

* **Time Complexity:** `O(N × r × p) iterations count times block size times parallelization`
* **Space Complexity:** `O(128 × r × N) memory cost bytes`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
