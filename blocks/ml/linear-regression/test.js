import { describe, it, expect } from '../../../test/test-harness.js';
import { LinearRegression } from './index.js';

await describe('ml/linear-regression', async () => {
  await it('should fit simple univariate coordinates data closely', () => {
    // Model representing y = 2x + 1
    const X = [[1], [2], [3], [4], [5]];
    const y = [3, 5, 7, 9, 11];

    const lr = new LinearRegression(0.05, 500);
    lr.fit(X, y);

    const predictions = lr.predict([[6], [7]]);
    
    // Check that predictions are close to 13 and 15
    expect(Math.abs(predictions[0] - 13) < 0.1).toBe(true);
    expect(Math.abs(predictions[1] - 15) < 0.1).toBe(true);
  });
});
