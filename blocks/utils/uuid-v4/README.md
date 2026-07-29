# Lego Block: `utils/uuid-v4`

Generates cryptographically random UUID v4 strings (xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx format). Works in Node.js, Deno, Bun, and browsers via the Web Crypto API. Also validates UUID format strings and generates short 8-character nanoid-style IDs.

> [!NOTE]
> **AI Agent Context:** Use this block when you need to generate universally unique identifiers for records, session tokens, or temporary IDs in both browser and server environments without importing the 'uuid' npm package.

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add utils/uuid-v4
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

* **Time Complexity:** `O(1) crypto random generation`
* **Space Complexity:** `O(1)`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
