# Lego Block: `compiler/parser-generator`

LL(1) parse table generator from context-free grammar specifications.

> [!NOTE]
> **AI Agent Context:** Use this block to compute FIRST and FOLLOW sets, and generate LL(1) parse tables for a context-free grammar.

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add compiler/parser-generator
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

* **Time Complexity:** `O(V + T) grammar rules compilation; O(N) parser speed (N = input length)`
* **Space Complexity:** `O(P) parse tree size`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
