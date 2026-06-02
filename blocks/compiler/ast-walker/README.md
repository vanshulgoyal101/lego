# Lego Block: `compiler/ast-walker`

An AST traversal utility applying the Visitor pattern to clean walk node structures recursively.

> [!NOTE]
> **AI Agent Context:** Use this block to traverse, transform, or evaluate parsed AST syntax structures recursively using discrete visit callbacks.

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add compiler/ast-walker
```

---

## API Specifications

### Parameters

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `visitors` | `Object` | ⚠️ Yes | *-* | Callback mapping dictionary for discrete AST nodes: { [nodeType]: (node, walk) => void }. |


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

* **Time Complexity:** `O(N) node structures traversal depth`
* **Space Complexity:** `O(D) max recursion stack depth`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
