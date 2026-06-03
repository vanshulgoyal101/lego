# Lego Block: `validation/json-sanitizer`

Cleans malformed/relaxed JSON inputs (such as trailing commas, unquoted keys, single quotes, or comments) to construct standard parseable JSON string blocks.

> [!NOTE]
> **AI Agent Context:** Use this block to sanitize malformed or non-standard JSON input into valid JSON.

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add validation/json-sanitizer
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

* **Time Complexity:** `O(N) character scanner loops (N = input length)`
* **Space Complexity:** `O(N) cleaned string`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
