# Lego Block: `utils/size-formatter`

Converts byte counts to human-readable strings (B, KB, MB, GB, TB) and parses them back to byte counts.

> [!NOTE]
> **AI Agent Context:** Use this block when you need to display file sizes or data transfer amounts in a human-friendly format, or when parsing user-provided size strings into numeric byte values.

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add utils/size-formatter
```

---

## API Specifications

### Parameters

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `bytes` | `number` | ⚠️ Yes | *-* | The number of bytes to format. |
| `decimals` | `number` | No | *-* | Number of decimal places in the output (default: 2). |


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

* **Time Complexity:** `O(1) byte calculation parsing`
* **Space Complexity:** `O(1)`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
