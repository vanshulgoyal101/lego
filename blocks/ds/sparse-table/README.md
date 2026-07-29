# Lego Block: `ds/sparse-table`

Static range minimum/maximum query structure with O(N log N) build time and O(1) query time.

> [!NOTE]
> **AI Agent Context:** Use this block for read-only arrays where you need repeated range min/max queries at O(1) each, such as RMQ problems, range GCD, or static histogram analysis.

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add ds/sparse-table
```

---

## API Specifications

### Parameters

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `array` | `number[]` | ⚠️ Yes | *-* | The static input array of numbers to build the sparse table over. |
| `mode` | `string` | ⚠️ Yes | *-* | Either 'min' or 'max', determines whether queries return the minimum or maximum over a range. |


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

* **Time Complexity:** `O(1) range queries after O(N log N) preprocessing`
* **Space Complexity:** `O(N log N) table size`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
