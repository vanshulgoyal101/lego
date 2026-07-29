# Lego Block: `db/vector-db`

An in-memory Vector Database supporting cosine similarity, Euclidean distance searches, metadata filter predicates, and K-Nearest Neighbor (K-NN) query calculations.

> [!NOTE]
> **AI Agent Context:** Use this block when building AI semantic searches, retrieval-augmented generation (RAG) contexts, recommender systems, or matching vector embeddings in pure JS.

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add db/vector-db
```

---

## API Specifications

### Parameters

*None*

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

* **Time Complexity:** `O(N × D) K-NN brute scan (N = vectors, D = dimensions)`
* **Space Complexity:** `O(N × D)`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
