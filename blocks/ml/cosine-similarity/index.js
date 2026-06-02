/**
 * Calculate cosine similarity between two vectors
 *
 * @param {number[]} a
 * @param {number[]} b
 * @returns {number} Cosine similarity value between -1.0 and 1.0
 */
export function cosineSimilarity(a, b) {
  if (!Array.isArray(a) || !Array.isArray(b)) {
    throw new Error('InvalidInput: Inputs must be arrays.');
  }
  if (a.length !== b.length) {
    throw new Error('VectorLengthMismatch: Vectors must be of the same length.');
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] ** 2;
    normB += b[i] ** 2;
  }

  if (normA === 0 || normB === 0) {
    return 0; // Avoid division by zero
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Calculate cosine distance (1 - cosineSimilarity) between two vectors
 *
 * @param {number[]} a
 * @param {number[]} b
 * @returns {number} Cosine distance value between 0.0 and 2.0
 */
export function cosineDistance(a, b) {
  return 1 - cosineSimilarity(a, b);
}

/**
 * Computes pairwise similarity matrix for an array of vectors
 *
 * @param {number[][]} X - Matrix of feature vectors
 * @returns {number[][]} N x N similarity matrix
 */
export function pairwiseSimilarity(X) {
  if (!Array.isArray(X)) {
    throw new Error('InvalidInput: Input must be an array of vectors.');
  }
  const n = X.length;
  const matrix = Array.from({ length: n }, () => new Array(n).fill(0));

  for (let i = 0; i < n; i++) {
    for (let j = i; j < n; j++) {
      if (i === j) {
        matrix[i][j] = 1.0;
      } else {
        const sim = cosineSimilarity(X[i], X[j]);
        matrix[i][j] = sim;
        matrix[j][i] = sim;
      }
    }
  }

  return matrix;
}
