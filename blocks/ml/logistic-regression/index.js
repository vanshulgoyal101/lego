/**
 * Logistic Regression Binary Classifier
 */
export class LogisticRegression {
  /**
   * @param {number} [learningRate=0.1] - Step optimizer scale
   * @param {number} [epochs=1000] - Loop training iterations
   */
  constructor(learningRate = 0.1, epochs = 1000) {
    this.learningRate = learningRate;
    this.epochs = epochs;
    this.weights = [];
    this.bias = 0;
  }

  _sigmoid(z) {
    return 1 / (1 + Math.exp(-Math.max(-20, Math.min(20, z)))); // clamp inputs to avoid overflow
  }

  /**
   * Fit/train the classifier
   *
   * @param {number[][]} X - Training inputs [numSamples x numFeatures]
   * @param {number[]} y - Target classification labels (0 or 1)
   */
  fit(X, y) {
    const numSamples = X.length;
    const numFeatures = X[0].length;

    this.weights = new Array(numFeatures).fill(0);
    this.bias = 0;

    for (let epoch = 0; epoch < this.epochs; epoch++) {
      const dWeights = new Array(numFeatures).fill(0);
      let dBias = 0;

      for (let i = 0; i < numSamples; i++) {
        const linearModel = this._linear(X[i]);
        const prediction = this._sigmoid(linearModel);
        const error = prediction - y[i];

        for (let j = 0; j < numFeatures; j++) {
          dWeights[j] += error * X[i][j];
        }
        dBias += error;
      }

      // Update parameters
      for (let j = 0; j < numFeatures; j++) {
        this.weights[j] -= (this.learningRate * dWeights[j]) / numSamples;
      }
      this.bias -= (this.learningRate * dBias) / numSamples;
    }
  }

  _linear(features) {
    let result = this.bias;
    for (let i = 0; i < features.length; i++) {
      result += features[i] * this.weights[i];
    }
    return result;
  }

  /**
   * Predict probability values [0.0, 1.0] for inputs
   *
   * @param {number[][]} X
   * @returns {number[]} Array of output probabilities
   */
  predictProbability(X) {
    return X.map(sample => this._sigmoid(this._linear(sample)));
  }

  /**
   * Predict binary labels (0 or 1) using 0.5 threshold boundary
   *
   * @param {number[][]} X
   * @returns {number[]} Array of binary outputs
   */
  predict(X) {
    return this.predictProbability(X).map(p => (p >= 0.5 ? 1 : 0));
  }
}
