# Lego Block: `encoding/json-patch`

RFC 6902 JSON Patch implementation supporting apply, diff generation, and patch validation for add, remove, replace, copy, move, and test operations.

> [!NOTE]
> **AI Agent Context:** Use this block when you need to efficiently transmit document changes (only the diff, not full document), implement optimistic UI updates, or apply structured changes to JSON data according to the RFC 6902 standard. Suitable for collaborative editing, API PATCH requests, and change tracking.

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add encoding/json-patch
```

---

## API Specifications

### Parameters

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `doc` | `Object` | ⚠️ Yes | *-* | The JSON document to apply a patch to. |
| `patch` | `Array` | ⚠️ Yes | *-* | Array of RFC 6902 patch operation objects (each with op, path, and optionally value/from). |
| `original` | `Object` | No | *-* | The original document used to generate a diff (used by diff()). |
| `modified` | `Object` | No | *-* | The modified document to compare against original (used by diff()). |


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

* **Time Complexity:** `O(P × D) patch instructions × tree depth`
* **Space Complexity:** `O(D)`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
