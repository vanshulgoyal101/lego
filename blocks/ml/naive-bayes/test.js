import { describe, it, expect } from '../../../test/test-harness.js';
import { NaiveBayes } from './index.js';

await describe('ml/naive-bayes', async () => {
  await it('should classify documents based on bag-of-words arrays correctly', () => {
    // 2 features: [count of "loan", count of "money", count of "science"]
    const X = [
      [3, 2, 0], // Finance document
      [4, 1, 0], // Finance document
      [0, 1, 5], // Science document
      [1, 0, 4]  // Science document
    ];
    const y = ['Finance', 'Finance', 'Science', 'Science'];

    const model = new NaiveBayes(1.0);
    model.fit(X, y);

    const predictions = model.predict([
      [2, 2, 0], // should be Finance
      [0, 0, 3]  // should be Science
    ]);

    expect(predictions[0]).toBe('Finance');
    expect(predictions[1]).toBe('Science');
  });
});
