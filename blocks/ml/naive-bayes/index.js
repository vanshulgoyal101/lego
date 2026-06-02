/**
 * Multinomial Naive Bayes Classifier
 */
export class NaiveBayes {
  /**
   * @param {number} [alpha=1.0] - Laplace smoothing factor
   */
  constructor(alpha = 1.0) {
    this.alpha = alpha;
    this.classCounts = {};
    this.featureCounts = {};
    this.classTotals = {};
    this.vocabularySize = 0;
    this.classes = [];
  }

  /**
   * Train the Naive Bayes model using feature occurrence counts
   *
   * @param {number[][]} X - Word counts vectors mapping [numSamples x numFeatures]
   * @param {Array} y - Array of class labels (strings or numbers)
   */
  fit(X, y) {
    const numSamples = X.length;
    const numFeatures = X[0].length;
    this.vocabularySize = numFeatures;

    const classSet = new Set(y);
    this.classes = Array.from(classSet);

    // Initialize counts
    for (const c of this.classes) {
      this.classCounts[c] = 0;
      this.classTotals[c] = 0;
      this.featureCounts[c] = new Float64Array(numFeatures);
    }

    // Accumulate frequencies
    for (let i = 0; i < numSamples; i++) {
      const c = y[i];
      this.classCounts[c]++;
      for (let j = 0; j < numFeatures; j++) {
        const count = X[i][j];
        this.featureCounts[c][j] += count;
        this.classTotals[c] += count;
      }
    }
  }

  /**
   * Predict labels for inputs
   *
   * @param {number[][]} X
   * @returns {Array} List of best predicted class labels
   */
  predict(X) {
    const totalSamples = Object.values(this.classCounts).reduce((a, b) => a + b, 0);

    return X.map(sample => {
      let bestClass = null;
      let maxLogProb = -Infinity;

      for (const c of this.classes) {
        // Log-probability of class prior: log(P(c))
        const classPrior = this.classCounts[c] / totalSamples;
        let logProb = Math.log(classPrior);

        // Sum log-likelihoods of features: log(P(x_i | c))
        const divisor = this.classTotals[c] + this.alpha * this.vocabularySize;
        for (let j = 0; j < sample.length; j++) {
          const count = sample[j];
          if (count > 0) {
            const wordProb = (this.featureCounts[c][j] + this.alpha) / divisor;
            logProb += count * Math.log(wordProb);
          }
        }

        if (logProb > maxLogProb) {
          maxLogProb = logProb;
          bestClass = c;
        }
      }

      return bestClass;
    });
  }
}
