import { describe, it, expect } from '../../../test/test-harness.js';
import { Perceptron } from './index.js';

await describe('ml/perceptron', async () => {
  await it('should learn the logical AND operation', () => {
    const perceptron = new Perceptron(2, 0.1, 50);

    // AND gate dataset
    const dataset = [
      { inputs: [0, 0], label: 0 },
      { inputs: [0, 1], label: 0 },
      { inputs: [1, 0], label: 0 },
      { inputs: [1, 1], label: 1 }
    ];

    perceptron.train(dataset);

    expect(perceptron.predict([0, 0])).toBe(0);
    expect(perceptron.predict([0, 1])).toBe(0);
    expect(perceptron.predict([1, 0])).toBe(0);
    expect(perceptron.predict([1, 1])).toBe(1);
  });
});
