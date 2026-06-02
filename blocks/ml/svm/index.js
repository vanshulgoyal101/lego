/**
 * Linear Support Vector Machine (SVM) Classifier
 * Trained using Soft-margin Hinge Loss Gradient Descent.
 */
export class SVM {
  /**
   * @param {number} [c=1.0] - Regularization parameter
   * @param {number} [learningRate=0.001] - Optimization step rate
   * @param {number} [epochs=1000] - Training iterations loop limit
   */
  constructor(c = 1.0, learningRate = 0.001, epochs = 1000) {
    this.c = c;
    this.lr = learningRate;
    this.epochs = epochs;
    this.w = [];
    this.b = 0;
  }

  /**
   * Fit the binary classifier.
   * Expects labels to be encoded as -1 and 1.
   *
   * @param {number[][]} X - Training inputs
   * @param {number[]} y - Binary targets (-1 or 1)
   */
  fit(X, y) {
    const numSamples = X.length;
    const numFeatures = X[0].length;

    this.w = new Array(numFeatures).fill(0);
    this.b = 0;

    for (let epoch = 0; epoch < this.epochs; epoch++) {
      for (let i = 0; i < numSamples; i++) {
        const xi = X[i];
        const yi = y[i];

        // Decision boundary score check
        let margin = yi * (this._dot(xi, this.w) + this.b);

        if (margin >= 1) {
          // Correctly classified outside margin - penalize weights magnitude only
          for (let j = 0; j < numFeatures; j++) {
            this.w[j] -= this.lr * (2 * this.c * this.w[j]);
          }
        } else {
          // Misclassified or inside margin - penalize classification error + weights
          for (let j = 0; j < numFeatures; j++) {
            this.w[j] -= this.lr * (2 * this.c * this.w[j] - yi * xi[j]);
          }
          this.b += this.lr * yi;
        }
      }
    }
  }

  _dot(a, b) {
    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result += a[i] * b[i];
    }
    return result;
  }

  /**
   * Predict output labels (-1 or 1)
   *
   * @param {number[][]} X
   * @returns {number[]} Array of classifications (-1 or 1)
   */
  predict(X) {
    return X.map(sample => {
      const val = this._dot(sample, this.w) + this.b;
      return val >= 0 ? 1 : -1;
    });
  }
}
