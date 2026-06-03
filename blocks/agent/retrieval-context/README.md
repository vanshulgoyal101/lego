# Lego Block: `agent/retrieval-context`

Builds retrieval-augmented generation (RAG) context by chunking documents, scoring chunks against a query with TF-IDF cosine similarity, and injecting the top-K results into a prompt.

> [!NOTE]
> **AI Agent Context:** Use this block when you need to implement RAG (retrieval-augmented generation): splitting large text corpora into overlapping chunks, ranking those chunks by relevance to a user query using TF-IDF cosine similarity, and assembling the most relevant chunks into a context string for an LLM prompt. Ideal for question-answering over documents, knowledge-base lookups, and any scenario where you need to ground an LLM response in retrieved text.

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add agent/retrieval-context
```

---

## API Specifications

### Parameters

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `text` | `string` | ⚠️ Yes | *-* | The source text to split into chunks (used by chunkText). |
| `options.chunkSize` | `number` | No | *-* | Maximum number of characters per chunk (default: 500). |
| `options.overlap` | `number` | No | *-* | Number of characters to overlap between consecutive chunks (default: 50). |
| `topK` | `number` | No | *-* | Number of top-scoring chunks to return from search (default: 3). |
| `documents` | `Array<string | { id: string, text: string }>` | ⚠️ Yes | *-* | Array of documents (strings or objects) to index in RetrievalContext. |
| `query` | `string` | ⚠️ Yes | *-* | The search query used to score and retrieve relevant chunks. |
| `separator` | `string` | No | *-* | String separator used to join chunks in buildContext (default: '\n---\n'). |


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

* **Time Complexity:** `O(N × Q) chunk search cosine ranking (N = chunks, Q = query terms)`
* **Space Complexity:** `O(C) memory chunks data structures`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
