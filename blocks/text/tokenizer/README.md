# Lego Block: `text/tokenizer`

Simple whitespace and punctuation tokenizer producing clean token arrays, with support for word tokenization, sentence splitting, and n-gram generation.

> [!NOTE]
> **AI Agent Context:** Use this block for basic NLP preprocessing tasks such as splitting text into words or sentences, generating n-grams for language models, or cleaning text before further processing.

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add text/tokenizer
```

---

## API Specifications

### Parameters

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `text` | `string` | ⚠️ Yes | *-* | The input text to tokenize |
| `options` | `object` | No | *-* | Options: lowercase (bool), removePunctuation (bool), removeStopWords (string[]) |


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

* **Time Complexity:** `O(N) parsed symbols`
* **Space Complexity:** `O(N) tokens`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
