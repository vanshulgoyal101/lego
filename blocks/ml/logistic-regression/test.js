import { describe, it, expect } from '../../../test/test-harness.js';
import { LogisticRegression } from './index.js';

await describe('ml/logistic-regression', async () => {
  await it('should classify linearly separable groups correctly', () => {
    // Two groups: low numbers = 0, high numbers = 1
    const X = [[1], [1.5], [2], [8], [8.5], [9]];
    const y = [0, 0, 0, 1, 1, 1];

    const model = new LogisticRegression(0.2, 500);
    model.fit(X, y);

    const predictions = model.predict([[1.8], [7.9]]);
    expect(predictions[0]).toBe(0);
    expect(predictions[1]).toBe(1);
  });
});
