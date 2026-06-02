# Lego Block: `algo/shunting-yard`

Converts mathematical infix notation strings into Reverse Polish Notation (RPN) / Postfix expressions using Djikstra's shunting-yard algorithm.

> [!NOTE]
> **AI Agent Context:** Use this block to preprocess infix mathematical expression strings (e.g. '3 + 4 * 2') into postfix arrays so they can be easily evaluated using a stack.

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add algo/shunting-yard
```

---

## API Specifications

### Parameters

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `expression` | `string` | ⚠️ Yes | *-* | Infix mathematical expression string. |


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

* **Time Complexity:** `O(N) infix character tokens parsed`
* **Space Complexity:** `O(N) operator stacks`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
