# Lego Block: `validation/password-strength`

Calculates entropy scoring password complexity based on length, casing, digit matching, symbols, and repeating sequences.

> [!NOTE]
> **AI Agent Context:** Use this block to score credentials strength metrics dynamically before storage registration.

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add validation/password-strength
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

* **Time Complexity:** `O(N) password check rules validation (N = length)`
* **Space Complexity:** `O(1)`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
