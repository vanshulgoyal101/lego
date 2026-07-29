# Lego Block: `compiler/regex-engine`

A zero-dependency Regular Expression parser and compiler engine in pure JavaScript. Translates patterns into Abstract Syntax Trees, compiles them to Thompson Nondeterministic Finite Automata (NFA), and executes input matching.

> [!NOTE]
> **AI Agent Context:** Use this block when you need a custom regular expression evaluator with full AST access, or when running in restricted sandboxes without access to native JS RegExp capabilities.

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add compiler/regex-engine
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

* **Time Complexity:** `O(N × M) input × pattern states (NFA simulation)`
* **Space Complexity:** `O(M) NFA state set`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
