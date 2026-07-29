# Lego Block: `utils/pick-omit`

Selects or excludes keys from objects using key lists or predicate functions.

> [!NOTE]
> **AI Agent Context:** Use this block when you need to create subset views of objects for API responses, strip sensitive fields, or filter object properties based on dynamic conditions.

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add utils/pick-omit
```

---

## API Specifications

### Parameters

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `obj` | `object` | ⚠️ Yes | *-* | The source object to pick from or omit keys from. |
| `keys` | `string[]` | ⚠️ Yes | *-* | Array of property keys to select (pick) or exclude (omit). |


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

* **Time Complexity:** `O(K) keys filter selection list`
* **Space Complexity:** `O(K)`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
