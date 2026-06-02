import { DecisionTree } from '../decision-tree/index.js';

/**
 * Random Forest Ensemble Classifier and Regressor
 */
export class RandomForest {
  /**
   * @param {Object} [options={}]
   * @param {number} [options.nEstimators=10] - Number of trees in the forest
   * @param {number} [options.maxDepth=Infinity] - Max depth of each decision tree
   * @param {number} [options.minSamplesSplit=2] - Minimum samples to split a node
   * @param {string} [options.criterion='gini'] - 'gini' | 'entropy' | 'mse'
   * @param {string|number} [options.maxFeatures='sqrt'] - Features selection strategy per tree
   */
  constructor(options = {}) {
    this.nEstimators = options.nEstimators || 10;
    this.maxDepth = options.maxDepth || Infinity;
    this.minSamplesSplit = options.minSamplesSplit || 2;
    this.criterion = options.criterion || 'gini';
    this.maxFeatures = options.maxFeatures || 'sqrt';
    this.trees = [];
    this.treeFeatures = [];
  }

  /**
   * Fit the ensemble on training features and targets
   *
   * @param {number[][]} X - Training features dimensions size [numSamples x numFeatures]
   * @param {Array} y - Target labels or numeric targets list
   */
  fit(X, y) {
    if (!Array.isArray(X) || !Array.isArray(y) || X.length === 0 || X.length !== y.length) {
      throw new Error('InvalidInput: X and y must be matching arrays of equal length.');
    }

    const numSamples = X.length;
    const numFeatures = X[0].length;
    this.trees = [];
    this.treeFeatures = [];

    let k = numFeatures;
    if (this.maxFeatures === 'sqrt') {
      k = Math.max(1, Math.floor(Math.sqrt(numFeatures)));
    } else if (typeof this.maxFeatures === 'number') {
      k = Math.min(numFeatures, this.maxFeatures);
    }

    for (let i = 0; i < this.nEstimators; i++) {
      // 1. Bootstrap sample
      const bootX = [];
      const bootY = [];
      for (let s = 0; s < numSamples; s++) {
        const idx = Math.floor(Math.random() * numSamples);
        bootX.push(X[idx]);
        bootY.push(y[idx]);
      }

      // 2. Select subset of features indices
      const featuresIndices = [];
      while (featuresIndices.length < k) {
        const fIdx = Math.floor(Math.random() * numFeatures);
        if (!featuresIndices.includes(fIdx)) {
          featuresIndices.push(fIdx);
        }
      }
      featuresIndices.sort((a, b) => a - b);
      this.treeFeatures.push(featuresIndices);

      const subX = bootX.map(row => featuresIndices.map(f => row[f]));

      // 3. Create and fit individual tree
      const tree = new DecisionTree({
        criterion: this.criterion,
        maxDepth: this.maxDepth,
        minSamplesSplit: this.minSamplesSplit
      });
      tree.fit(subX, bootY);
      this.trees.push(tree);
    }
  }

  /**
   * Predict labels/targets for given feature matrix
   *
   * @param {number[][]} X
   * @returns {Array} Array of predicted labels or targets
   */
  predict(X) {
    if (this.trees.length === 0) {
      throw new Error('ModelNotFittedError: Run fit() before predicting.');
    }

    return X.map(sample => {
      const votes = {};
      for (let i = 0; i < this.trees.length; i++) {
        const tree = this.trees[i];
        const featuresIndices = this.treeFeatures[i];
        const subSample = featuresIndices.map(f => sample[f]);
        const pred = tree.predict([subSample])[0];
        votes[pred] = (votes[pred] || 0) + 1;
      }

      if (this.criterion === 'mse') {
        let sum = 0;
        let count = 0;
        for (const val of Object.keys(votes)) {
          const v = Number(val);
          sum += v * votes[val];
          count += votes[val];
        }
        return sum / count;
      } else {
        let bestLabel = null;
        let maxVotes = -1;
        for (const label of Object.keys(votes)) {
          if (votes[label] > maxVotes) {
            maxVotes = votes[label];
            bestLabel = label;
          }
        }
        if (bestLabel === 'true') return true;
        if (bestLabel === 'false') return false;
        if (!isNaN(bestLabel) && bestLabel !== '') return Number(bestLabel);
        return bestLabel;
      }
    });
  }
}
