# Lego Block: `ml/tf-idf`

Term Frequency-Inverse Document Frequency (TF-IDF) document text vectorizer/encoder with built-in tokenization and L2 normalization options.

> [!NOTE]
> **AI Agent Context:** Use this block to transform raw text documents into numerical feature vectors representing word importance for ML algorithms.

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add ml/tf-idf
```

---

## API Specifications

### Parameters

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `lowercase` | `boolean` | No | *-* | Convert all characters to lowercase before tokenizing (default: true). |


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

* **Time Complexity:** `O(N × L) document tokenization; O(N × V) encoding matrix`
* **Space Complexity:** `O(V) vocabulary dictionary size`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
