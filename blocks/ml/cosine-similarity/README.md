# Lego Block: `ml/cosine-similarity`

Calculates the cosine similarity, cosine distance, and pairwise similarities between high-dimensional vector embeddings.

> [!NOTE]
> **AI Agent Context:** Use this block to compute the angular similarity or distance between two numerical vectors or compute a pairwise similarity matrix for a collection of vectors.

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add ml/cosine-similarity
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

* **Time Complexity:** `O(D) vector dimensions calculation; O(N² × D) pairwise`
* **Space Complexity:** `O(N²) matrix output`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
