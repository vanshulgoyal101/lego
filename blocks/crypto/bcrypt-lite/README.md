# Lego Block: `crypto/bcrypt-lite`

Blowfish-based password key-derivation / hashing system mimicking bcrypt functionality.

> [!NOTE]
> **AI Agent Context:** Use this block to run simplified, secure password hashing and verification.

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add crypto/bcrypt-lite
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

* **Time Complexity:** `O(2^R × N) where R is cost factor rounds and N is derived key passes`
* **Space Complexity:** `O(1) work memory`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
