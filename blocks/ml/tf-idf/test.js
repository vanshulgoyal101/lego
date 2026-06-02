import { describe, it, expect } from '../../../test/test-harness.js';
import { TFIDF } from './index.js';

await describe('ml/tf-idf', async () => {
  await it('should build vocabulary, compute idfs, and produce normalized tf-idf vectors', () => {
    const documents = [
      'the cat sat on the mat',
      'the dog sat on the rug'
    ];

    const tfidf = new TFIDF();
    const vectors = tfidf.fitTransform(documents);

    expect(vectors.length).toBe(2);
    expect(vectors[0].length).toBe(Object.keys(tfidf.vocabulary).length);

    // Verify words unique to document 0 (e.g. 'cat', 'mat') have higher value or presence in vectors[0] and 0 in vectors[1]
    const catIdx = tfidf.vocabulary['cat'];
    const dogIdx = tfidf.vocabulary['dog'];

    expect(catIdx !== undefined).toBe(true);
    expect(dogIdx !== undefined).toBe(true);

    expect(vectors[0][catIdx] > 0).toBe(true);
    expect(vectors[0][dogIdx]).toBe(0);

    expect(vectors[1][dogIdx] > 0).toBe(true);
    expect(vectors[1][catIdx]).toBe(0);

    // Verify L2 norm of the vectors is close to 1
    const l2Norm = vec => Math.sqrt(vec.reduce((sum, v) => sum + v ** 2, 0));
    expect(Math.abs(l2Norm(vectors[0]) - 1.0) < 1e-6).toBe(true);
    expect(Math.abs(l2Norm(vectors[1]) - 1.0) < 1e-6).toBe(true);
  });
});
