import { describe, it, expect } from '../../../test/test-harness.js';
import { cosineSimilarity, cosineDistance, pairwiseSimilarity } from './index.js';

await describe('ml/cosine-similarity', async () => {
  await it('should correctly compute cosine similarity and distance for identical, orthogonal, and opposite vectors', () => {
    const v1 = [1, 2, 3];
    const v2 = [1, 2, 3];
    const v3 = [-1, -2, -3];
    const v4 = [0, 0, 0]; // Zero vector
    const v_ortho1 = [1, 0];
    const v_ortho2 = [0, 1];

    // Identical vectors similarity should be 1
    expect(Math.abs(cosineSimilarity(v1, v2) - 1.0) < 1e-6).toBe(true);
    expect(cosineDistance(v1, v2) < 1e-6).toBe(true);

    // Opposite vectors similarity should be -1
    expect(Math.abs(cosineSimilarity(v1, v3) - (-1.0)) < 1e-6).toBe(true);
    expect(Math.abs(cosineDistance(v1, v3) - 2.0) < 1e-6).toBe(true);

    // Orthogonal vectors similarity should be 0
    expect(Math.abs(cosineSimilarity(v_ortho1, v_ortho2)) < 1e-6).toBe(true);
    expect(Math.abs(cosineDistance(v_ortho1, v_ortho2) - 1.0) < 1e-6).toBe(true);

    // Zero vector similarity should be 0
    expect(cosineSimilarity(v1, v4)).toBe(0);
  });

  await it('should compute pairwise similarity matrix correctly', () => {
    const vectors = [
      [1, 0],
      [0, 1],
      [1, 1]
    ];

    const matrix = pairwiseSimilarity(vectors);

    expect(matrix.length).toBe(3);
    expect(matrix[0][0]).toBe(1.0);
    expect(Math.abs(matrix[0][1])) .toBe(0);
    // similarity of [1,0] and [1,1] is 1/sqrt(2) approx 0.707
    expect(Math.abs(matrix[0][2] - 0.707106) < 1e-5).toBe(true);
  });
});
