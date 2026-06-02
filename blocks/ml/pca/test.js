import { describe, it, expect } from '../../../test/test-harness.js';
import { PCA } from './index.js';

await describe('ml/pca', async () => {
  await it('should reduce dimensionality of features correctly', () => {
    // 3D coordinates representing a 2D line with noise
    const X = [
      [2.5, 2.4, 1.0],
      [0.5, 0.7, 1.1],
      [2.2, 2.9, 0.9],
      [1.9, 2.2, 1.0],
      [3.1, 3.0, 1.2],
      [2.3, 2.7, 0.8],
      [2.0, 1.6, 1.1],
      [1.0, 1.1, 0.9],
      [1.5, 1.6, 1.0],
      [1.1, 0.9, 1.0]
    ];

    const pca = new PCA(2); // project down to 2 components
    pca.fit(X);

    const transformed = pca.transform(X);
    expect(transformed.length).toBe(10);
    expect(transformed[0].length).toBe(2);
  });
});
