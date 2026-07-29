# Lego Block: `utils/flatten`

Flattens nested arrays to any depth, with helpers for shallow, deep, and infinite flattening.

> [!NOTE]
> **AI Agent Context:** Use this block when you need to reduce nested array structures into a single-level array, such as when combining results from nested map operations or normalizing tree-shaped data.

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add utils/flatten
```

---

## API Specifications

### Parameters

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `array` | `any[]` | ⚠️ Yes | *-* | The nested array to flatten. |
| `depth` | `number` | No | *-* | How many levels deep to flatten (default: 1). Use Infinity for full depth. |


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

* **Time Complexity:** `O(N) nested elements count`
* **Space Complexity:** `O(D) depth array copy`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
