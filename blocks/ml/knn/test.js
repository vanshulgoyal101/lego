import { describe, it, expect } from '../../../test/test-harness.js';
import {KNN} from './index.js';

  await describe('ml/knn', async () => {
    await it('should classify points correctly with Euclidean distance', () => {
      const knn = new KNN({ k: 3 });
      const X = [[1,1], [1,2], [2,1], [10,10], [11,10], [10,11]];
      const y = ['A', 'A', 'A', 'B', 'B', 'B'];
      knn.fit(X, y);

      const predictions = knn.predict([[1.5, 1.5], [10.5, 10.5]]);
      expect(predictions[0]).toBe('A');
      expect(predictions[1]).toBe('B');
    });

    await it('should classify using Manhattan distance', () => {
      const knn = new KNN({ k: 1, distanceMetric: 'manhattan' });
      knn.fit([[0,0],[10,0]], ['origin', 'right']);
      expect(knn.predict([[1,0]])[0]).toBe('origin');
      expect(knn.predict([[9,0]])[0]).toBe('right');
    });

    await it('should regress continuous values correctly', () => {
      const knn = new KNN({ k: 2 });
      knn.fit([[1],[2],[3],[4]], [10, 20, 30, 40]);
      const pred = knn.predict([[1.5]], true);
      expect(pred[0]).toBe(15); // average of k=2 nearest: 10+20=15
    });

    await it('should apply feature standardization', () => {
      const knn = new KNN({ k: 3, standardize: true });
      const X = [[100,1],[200,2],[300,3],[1000,10],[1100,11],[1200,12]];
      const y = ['low','low','low','high','high','high'];
      knn.fit(X, y);
      const pred = knn.predict([[150, 1.5]]);
      expect(pred[0]).toBe('low');
    });

    await it('should throw if predicting before fit', () => {
      const knn = new KNN();
      expect(() => knn.predict([[1,2]])).toThrow('not fitted');
    });

    await it('should support distance-based weighting', () => {
      const knn = new KNN({ k: 3, weighting: 'distance' });
      const X = [[0],[5],[6]];
      const y = ['A','B','B'];
      knn.fit(X, y);
      // query at 5.5 is closer to B samples
      const pred = knn.predict([[5.5]]);
      expect(pred[0]).toBe('B');
    });
  });
