/**
 * In-memory Vector Database.
 * Performs similarity search on multidimensional vector embeddings (e.g. text/image embeddings).
 * Supports: Cosine Similarity, Euclidean Distance, and metadata filtering.
 */

// Cosine similarity between two vectors
export function cosineSimilarity(v1, v2) {
  if (v1.length !== v2.length) {
    throw new Error('VectorLengthMismatchError: Vectors must have matching dimensions.');
  }
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < v1.length; i++) {
    dotProduct += v1[i] * v2[i];
    normA += v1[i] * v1[i];
    normB += v2[i] * v2[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Euclidean distance between two vectors
export function euclideanDistance(v1, v2) {
  if (v1.length !== v2.length) {
    throw new Error('VectorLengthMismatchError: Vectors must have matching dimensions.');
  }
  let sum = 0;
  for (let i = 0; i < v1.length; i++) {
    const diff = v1[i] - v2[i];
    sum += diff * diff;
  }
  return Math.sqrt(sum);
}

/**
 * Vector Database class.
 */
export class VectorDb {
  constructor() {
    this.vectors = new Map(); // id -> { vector, metadata }
  }

  insert(id, vector, metadata = {}) {
    if (!Array.isArray(vector)) {
      throw new TypeError('Vector must be an array of numbers');
    }
    this.vectors.set(id, {
      vector: [...vector],
      metadata: { ...metadata }
    });
  }

  delete(id) {
    return this.vectors.delete(id);
  }

  get(id) {
    return this.vectors.get(id);
  }

  clear() {
    this.vectors.clear();
  }

  /**
   * Queries the K-Nearest Neighbors (K-NN) relative to a query vector.
   * 
   * @param {Array<number>} queryVector - Embedding vector to compare.
   * @param {number} k - Number of nearest items to return.
   * @param {Object} [options={}] - Config parameters.
   * @param {string} [options.metric='cosine'] - Similarity metric ('cosine' | 'euclidean').
   * @param {Object} [options.filter={}] - Metadata filter key-value pairs matching criteria.
   * @returns {Array<Object>} Sorted list of nearest matching vectors.
   */
  query(queryVector, k, options = {}) {
    if (!Array.isArray(queryVector)) {
      throw new TypeError('Query vector must be an array of numbers');
    }

    const metric = options.metric || 'cosine';
    const filter = options.filter || null;
    const results = [];

    for (const [id, entry] of this.vectors.entries()) {
      // 1. Evaluate metadata filter
      if (filter) {
        let match = true;
        for (const [key, val] of Object.entries(filter)) {
          if (entry.metadata[key] !== val) {
            match = false;
            break;
          }
        }
        if (!match) continue;
      }

      // 2. Calculate distance/similarity score
      let score = 0;
      if (metric === 'cosine') {
        score = cosineSimilarity(queryVector, entry.vector);
      } else if (metric === 'euclidean') {
        score = euclideanDistance(queryVector, entry.vector);
      } else {
        throw new Error(`Unsupported similarity metric: ${metric}`);
      }

      results.push({
        id,
        score,
        metadata: entry.metadata
      });
    }

    // 3. Sort results (Cosine high similarity is closer; Euclidean low distance is closer)
    if (metric === 'cosine') {
      results.sort((a, b) => b.score - a.score);
    } else {
      results.sort((a, b) => a.score - b.score);
    }

    return results.slice(0, k);
  }
}
