import { describe, it, expect } from '../../../test/test-harness.js';
import { SVM } from './index.js';

await describe('ml/svm', async () => {
  await it('should classify linearly separable groups using -1/1 labels correctly', () => {
    const X = [[1, 1], [1.5, 2], [2, 1], [8, 8], [9, 8], [8, 9]];
    const y = [-1, -1, -1, 1, 1, 1];

    const model = new SVM(1.0, 0.01, 500);
    model.fit(X, y);

    const predictions = model.predict([[1.8, 1.8], [8.5, 8.5]]);
    expect(predictions[0]).toBe(-1);
    expect(predictions[1]).toBe(1);
  });
});
