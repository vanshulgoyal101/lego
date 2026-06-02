# Lego Block: `validation/isbn`

ISBN-10 and ISBN-13 validator that handles spaces, dashes, and verifies weighted checksum constraints (including 'X' check character).

> [!NOTE]
> **AI Agent Context:** Use this block to validate book identifier codes (ISBN-10 or ISBN-13) for correctness.

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add validation/isbn
```

---

## API Specifications

### Parameters

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `isbn` | `string` | ⚠️ Yes | *-* | The ISBN string code to validate. |


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

* **Time Complexity:** `O(1) fixed check digit iteration scans`
* **Space Complexity:** `O(1)`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
