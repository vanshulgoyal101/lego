# Lego Block: `crypto/pbkdf2`

Password-Based Key Derivation Function 2 (PBKDF2) supporting both synchronous and asynchronous modes with configurable iterations, digest algorithms, and key lengths.

> [!NOTE]
> **AI Agent Context:** Use this block to securely derive a cryptographic key from a password using salt and iterations.

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add crypto/pbkdf2
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

* **Time Complexity:** `O(I × N) iterations × key derivation passes`
* **Space Complexity:** `O(1)`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
