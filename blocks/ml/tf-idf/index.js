/**
 * Term Frequency-Inverse Document Frequency (TF-IDF) Vectorizer
 */
export class TFIDF {
  /**
   * @param {Object} [options={}]
   * @param {boolean} [options.lowercase=true] - Lowercase strings before tokenizing
   */
  constructor(options = {}) {
    this.lowercase = options.lowercase !== false;
    this.vocabulary = {}; // term -> index
    this.idf = {};        // term -> idf value
    this.numDocuments = 0;
  }

  _tokenize(text) {
    if (typeof text !== 'string') {
      throw new Error('InvalidInput: Document must be a string.');
    }
    let t = text;
    if (this.lowercase) {
      t = t.toLowerCase();
    }
    return t.match(/\b\w+\b/g) || [];
  }

  /**
   * Fit vocabulary and compute document frequencies / IDF scores
   * @param {string[]} documents - Array of document strings
   */
  fit(documents) {
    if (!Array.isArray(documents)) {
      throw new Error('InvalidInput: Documents must be an array of strings.');
    }

    this.numDocuments = documents.length;
    const termDocCounts = {};

    for (const doc of documents) {
      const tokens = this._tokenize(doc);
      const uniqueTokens = new Set(tokens);

      for (const term of uniqueTokens) {
        termDocCounts[term] = (termDocCounts[term] || 0) + 1;
      }
    }

    this.vocabulary = {};
    this.idf = {};
    let index = 0;

    for (const term of Object.keys(termDocCounts)) {
      this.vocabulary[term] = index++;
      // smoothed IDF formula
      this.idf[term] = Math.log((1 + this.numDocuments) / (1 + termDocCounts[term])) + 1;
    }
  }

  /**
   * Transform documents to TF-IDF normalized vector representations
   * @param {string[]} documents - Array of document strings
   * @returns {number[][]} TF-IDF feature matrix (documents x vocab size)
   */
  transform(documents) {
    if (!Array.isArray(documents)) {
      throw new Error('InvalidInput: Documents must be an array of strings.');
    }

    const vocabSize = Object.keys(this.vocabulary).length;
    return documents.map(doc => {
      const tokens = this._tokenize(doc);
      const termCounts = {};
      for (const t of tokens) {
        termCounts[t] = (termCounts[t] || 0) + 1;
      }

      const vector = new Array(vocabSize).fill(0);
      for (const term of Object.keys(termCounts)) {
        if (this.vocabulary[term] !== undefined) {
          const idx = this.vocabulary[term];
          const tf = termCounts[term];
          vector[idx] = tf * this.idf[term];
        }
      }

      // L2 normalization
      let sumSq = 0;
      for (let i = 0; i < vocabSize; i++) {
        sumSq += vector[i] ** 2;
      }
      if (sumSq > 0) {
        const norm = Math.sqrt(sumSq);
        for (let i = 0; i < vocabSize; i++) {
          vector[i] /= norm;
        }
      }

      return vector;
    });
  }

  /**
   * Fit vocabulary and transform in one step
   * @param {string[]} documents
   * @returns {number[][]} TF-IDF feature matrix
   */
  fitTransform(documents) {
    this.fit(documents);
    return this.transform(documents);
  }
}
