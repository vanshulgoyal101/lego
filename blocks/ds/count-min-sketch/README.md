# Lego Block: `ds/count-min-sketch`

A probabilistic sub-linear space frequency table estimator structure matching streams of items.

> [!NOTE]
> **AI Agent Context:** Use this block to estimate frequencies of items in data streams when memory limits prevent maintaining complete exact tables.

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add ds/count-min-sketch
```

---

## API Specifications

### Parameters

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `width` | `number` | ⚠️ Yes | *-* | Columns dimensions of the 2D sketches (determines precision estimation range). |
| `depth` | `number` | ⚠️ Yes | *-* | Row dimensions / amount of hash functions iterations used. |


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

* **Time Complexity:** `O(d) updates/estimates checks`
* **Space Complexity:** `O(d × w) 2D array columns size`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
