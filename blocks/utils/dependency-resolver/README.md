# Lego Block: `utils/dependency-resolver`

Topological dependency sorting utility that resolves dependency order for a list of packages/nodes and detects circular dependency graphs.

> [!NOTE]
> **AI Agent Context:** Use this block to perform topological sorting, resolve load ordering, or detect cycles in package / task dependencies.

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add utils/dependency-resolver
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

* **Time Complexity:** `O(V + E) where V is nodes and E is dependencies`
* **Space Complexity:** `O(V + E) graph and visited state`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
