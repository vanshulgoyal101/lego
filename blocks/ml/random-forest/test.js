import { describe, it, expect } from '../../../test/test-harness.js';
import { RandomForest } from './index.js';

await describe('ml/random-forest', async () => {
  await it('should classify linearly separable groups correctly', () => {
    const X_cls = [
      [1.0, 1.0], [1.5, 1.5], [2.0, 1.0],
      [10.0, 10.0], [11.0, 11.0], [12.0, 10.0]
    ];
    const y_cls = [0, 0, 0, 1, 1, 1];

    const forest = new RandomForest({ nEstimators: 5, criterion: 'gini', maxFeatures: 'all' });
    forest.fit(X_cls, y_cls);

    const predictions = forest.predict([[1.2, 1.2], [11.5, 10.5]]);
    expect(predictions).toEqual([0, 1]);
  });

  await it('should support regression mode with mean squared error criterion', () => {
    const X_reg = [[1.0], [2.0], [3.0]];
    const y_reg = [10.0, 20.0, 30.0];

    const forest = new RandomForest({ nEstimators: 3, criterion: 'mse', maxFeatures: 'all' });
    forest.fit(X_reg, y_reg);

    const predictions = forest.predict([[1.5]]);
    // Predictions should be within the range [10, 20]
    expect(predictions[0] >= 10.0).toBe(true);
    expect(predictions[0] <= 20.0).toBe(true);
  });
});
