/**
 * Multivariate Linear Regression Model
 */
export class LinearRegression {
  /**
   * @param {number} [learningRate=0.01] - Optimization step size
   * @param {number} [epochs=1000] - Total optimization runs
   */
  constructor(learningRate = 0.01, epochs = 1000) {
    this.learningRate = learningRate;
    this.epochs = epochs;
    this.weights = [];
    this.bias = 0;
  }

  /**
   * Fit the linear weights and bias using Gradient Descent
   *
   * @param {number[][]} X - Training features dimensions size [numSamples x numFeatures]
   * @param {number[]} y - Target values
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
        const prediction = this._predictSample(X[i]);
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

  _predictSample(features) {
    let result = this.bias;
    for (let i = 0; i < features.length; i++) {
      result += features[i] * this.weights[i];
    }
    return result;
  }

  /**
   * Predict values for a dataset
   *
   * @param {number[][]} X
   * @returns {number[]} Array of output predictions
   */
  predict(X) {
    return X.map(sample => this._predictSample(sample));
  }
}
