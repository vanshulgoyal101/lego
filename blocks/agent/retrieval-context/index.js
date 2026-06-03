/**
 * agent/retrieval-context
 *
 * Retrieval-Augmented Generation (RAG) context builder.
 * Chunks documents, scores them against a query using TF-IDF cosine
 * similarity, and injects the top-K most relevant chunks into a prompt.
 */

/** Stop words filtered out during tokenization */
const STOP_WORDS = new Set([
  'a', 'an', 'the', 'is', 'it', 'in', 'on', 'at', 'to',
  'for', 'of', 'and', 'or', 'but',
]);

/**
 * Split a text string into overlapping chunks of a fixed character size.
 *
 * @param {string} text - The source text to split.
 * @param {object} [options={}] - Chunking options.
 * @param {number} [options.chunkSize=500] - Maximum characters per chunk.
 * @param {number} [options.overlap=50] - Number of characters to overlap between consecutive chunks.
 * @returns {{ id: number, text: string, start: number, end: number }[]}
 *   Array of chunk objects with a numeric id, the chunk text, and its
 *   start/end character positions in the original text.
 */
export function chunkText(text, options = {}) {
  const { chunkSize = 500, overlap = 50 } = options;

  if (typeof text !== 'string' || text.length === 0) return [];
  if (chunkSize <= 0) throw new RangeError('chunkSize must be greater than 0');
  if (overlap < 0) throw new RangeError('overlap must be >= 0');
  if (overlap >= chunkSize) throw new RangeError('overlap must be less than chunkSize');

  const chunks = [];
  let id = 0;
  let start = 0;
  const step = chunkSize - overlap;

  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    chunks.push({ id: id++, text: text.slice(start, end), start, end });
    start += step;
  }

  return chunks;
}

/**
 * Tokenize a string: lowercase, split on non-word characters, and remove
 * common English stop words.
 *
 * @param {string} text - Raw text to tokenize.
 * @returns {string[]} Array of meaningful lowercase tokens.
 */
export function tokenize(text) {
  if (typeof text !== 'string' || text.length === 0) return [];

  return text
    .toLowerCase()
    .split(/\W+/)
    .filter((token) => token.length > 0 && !STOP_WORDS.has(token));
}

/**
 * Compute term frequency for an array of tokens.
 *
 * @param {string[]} tokens
 * @returns {Map<string, number>}
 */
function termFrequency(tokens) {
  const tf = new Map();
  for (const token of tokens) {
    tf.set(token, (tf.get(token) ?? 0) + 1);
  }
  // Normalize by document length
  for (const [term, count] of tf) {
    tf.set(term, count / tokens.length);
  }
  return tf;
}

/**
 * Compute inverse document frequency for a set of terms across a corpus.
 *
 * @param {string[]} terms - Terms to compute IDF for.
 * @param {Array<{ text: string }>} corpus - All chunks in the index.
 * @returns {Map<string, number>}
 */
function inverseDocumentFrequency(terms, corpus) {
  const idf = new Map();
  const N = corpus.length;

  for (const term of terms) {
    const docsWithTerm = corpus.filter((chunk) =>
      tokenize(chunk.text).includes(term),
    ).length;
    // Classic smoothed IDF: log((N + 1) / (df + 1)) + 1
    idf.set(term, Math.log((N + 1) / (docsWithTerm + 1)) + 1);
  }

  return idf;
}

/**
 * Compute the TF-IDF cosine similarity score between a query and a single
 * chunk, given the full corpus (used to derive IDF weights).
 *
 * @param {string} query - The search query string.
 * @param {{ text: string }} chunk - A single chunk to score.
 * @param {Array<{ text: string }>} corpus - All chunks in the index.
 * @returns {number} Cosine similarity score in [0, 1].
 */
export function tfidfScore(query, chunk, corpus) {
  const queryTokens = tokenize(query);
  const chunkTokens = tokenize(chunk.text);

  if (queryTokens.length === 0 || chunkTokens.length === 0) return 0;

  // Union of terms from both query and chunk
  const allTerms = [...new Set([...queryTokens, ...chunkTokens])];

  const idf = inverseDocumentFrequency(allTerms, corpus);
  const queryTF = termFrequency(queryTokens);
  const chunkTF = termFrequency(chunkTokens);

  // Build TF-IDF vectors
  let dotProduct = 0;
  let queryMagnitude = 0;
  let chunkMagnitude = 0;

  for (const term of allTerms) {
    const idfVal = idf.get(term) ?? 0;
    const qVal = (queryTF.get(term) ?? 0) * idfVal;
    const cVal = (chunkTF.get(term) ?? 0) * idfVal;

    dotProduct += qVal * cVal;
    queryMagnitude += qVal * qVal;
    chunkMagnitude += cVal * cVal;
  }

  const magnitude = Math.sqrt(queryMagnitude) * Math.sqrt(chunkMagnitude);
  return magnitude === 0 ? 0 : dotProduct / magnitude;
}

/**
 * RetrievalContext — a lightweight RAG context builder.
 *
 * @example
 * const ctx = new RetrievalContext({ topK: 3 });
 * ctx.index(['Document one text...', 'Document two text...']);
 * const context = ctx.buildContext('my query');
 */
export class RetrievalContext {
  /**
   * @param {object} [options={}]
   * @param {number} [options.topK=3] - Number of top chunks to retrieve.
   * @param {number} [options.chunkSize=500] - Characters per chunk.
   * @param {number} [options.overlap=50] - Character overlap between chunks.
   */
  constructor({ topK = 3, chunkSize = 500, overlap = 50 } = {}) {
    this.topK = topK;
    this.chunkSize = chunkSize;
    this.overlap = overlap;
    /** @type {Array<{ id: number, text: string, start: number, end: number, docId: string }>} */
    this._chunks = [];
  }

  /**
   * Index an array of documents. Each document is chunked and stored
   * internally for later retrieval.
   *
   * @param {Array<string | { id: string, text: string }>} documents
   *   Array of raw strings or objects with `id` and `text` fields.
   * @returns {this} For chaining.
   */
  index(documents) {
    for (const doc of documents) {
      const { id: docId = String(this._chunks.length), text } =
        typeof doc === 'string' ? { id: undefined, text: doc } : doc;

      const chunks = chunkText(text, {
        chunkSize: this.chunkSize,
        overlap: this.overlap,
      });

      for (const chunk of chunks) {
        this._chunks.push({ ...chunk, docId });
      }
    }
    return this;
  }

  /**
   * Score all indexed chunks against the query and return the top-K results.
   *
   * @param {string} query - The search query.
   * @returns {Array<{ chunk: object, score: number }>}
   *   Top-K chunks sorted by descending TF-IDF cosine similarity score.
   */
  search(query) {
    if (this._chunks.length === 0) return [];

    const scored = this._chunks.map((chunk) => ({
      chunk,
      score: tfidfScore(query, chunk, this._chunks),
    }));

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, this.topK);
  }

  /**
   * Search and concatenate the top-K chunk texts into a single context string
   * suitable for injection into an LLM prompt.
   *
   * @param {string} query - The search query.
   * @param {string} [separator='\n---\n'] - String used to join chunks.
   * @returns {string} The assembled context string.
   */
  buildContext(query, separator = '\n---\n') {
    const results = this.search(query);
    return results.map((r) => r.chunk.text).join(separator);
  }

  /**
   * Remove all indexed chunks, resetting the instance to its initial state.
   *
   * @returns {this} For chaining.
   */
  clear() {
    this._chunks = [];
    return this;
  }
}
