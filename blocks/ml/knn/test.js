import { describe, it, expect } from '../../../test/test-harness.js';
import { KNN } from './index.js';

await describe('ml/knn', async () => {
  await it('should classify points correctly', () => {
    const knn = new KNN(3);
    const X = [[1, 2], [2, 3], [5, 5], [6, 7]];
    const y = ['A', 'A', 'B', 'B'];

    knn.fit(X, y);

    const predictions = knn.predict([[2, 2], [5, 6]]);
    expect(predictions[0]).toBe('A');
    expect(predictions[1]).toBe('B');
  });

  await it('should perform regression averages correctly', () => {
    const knn = new KNN(2);
    const X = [[1], [2], [4]];
    const y = [10, 20, 40];

    knn.fit(X, y);

    const predictions = knn.predict([[1.5]], true);
    expect(predictions[0]).toBe(15); // average of 10 and 20
  });
});
