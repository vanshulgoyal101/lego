/**
 * Zero-Dependency Decision Tree Engine.
 * Features:
 * 1. Support for Classification (Gini Impurity, Information Gain Entropy).
 * 2. Support for Regression (Mean Squared Error Variance Reduction).
 * 3. Recursive binary splitting on continuous features.
 * 4. Regularization constraints: Max Depth, Minimum Samples Split.
 * 5. Feature Importance Calculations.
 * 6. Model serialization (JSON export/import).
 */

class TreeNode {
  constructor(feature = null, threshold = null, left = null, right = null, value = null, impurity = null) {
    this.feature = feature;        // Feature index for the split
    this.threshold = threshold;    // Split boundary value
    this.left = left;              // Left child node (threshold <= value)
    this.right = right;            // Right child node (threshold > value)
    this.value = value;            // Leaf node output prediction value
    this.impurity = impurity;      // Node impurity score
  }

  isLeaf() {
    return this.value !== null;
  }
}

export class DecisionTree {
  constructor(options = {}) {
    this.criterion = options.criterion || 'gini'; // 'gini', 'entropy', or 'mse'
    this.maxDepth = options.maxDepth || Infinity;
    this.minSamplesSplit = options.minSamplesSplit || 2;
    this.root = null;
    this.nFeatures = 0;
    this.featureImportances = [];
  }

  /**
   * Train the decision tree.
   * @param {Array<Array<number>>} X - Feature matrix (samples x features)
   * @param {Array<number>} y - Target label array
   */
  fit(X, y) {
    if (!Array.isArray(X) || !Array.isArray(y) || X.length === 0 || X.length !== y.length) {
      throw new Error('InvalidInput: X and y must be matching arrays of equal length.');
    }
    
    this.nFeatures = X[0].length;
    this.featureImportances = new Float64Array(this.nFeatures);
    this.root = this._buildTree(X, y, 0);
    
    // Normalize feature importances
    const totalImportance = this.featureImportances.reduce((a, b) => a + b, 0);
    if (totalImportance > 0) {
      for (let i = 0; i < this.nFeatures; i++) {
        this.featureImportances[i] /= totalImportance;
      }
    }
  }

  /**
   * Predict targets for input feature matrix.
   */
  predict(X) {
    if (!this.root) throw new Error('ModelNotFittedError: Run fit() before predicting.');
    return X.map(sample => this._predictSample(this.root, sample));
  }

  _predictSample(node, sample) {
    if (node.isLeaf()) {
      return node.value;
    }
    if (sample[node.feature] <= node.threshold) {
      return this._predictSample(node.left, sample);
    } else {
      return this._predictSample(node.right, sample);
    }
  }

  _buildTree(X, y, depth) {
    const nSamples = X.length;
    const nLabels = new Set(y).size;

    // Terminal leaf base cases
    if (
      depth >= this.maxDepth ||
      nSamples < this.minSamplesSplit ||
      nLabels === 1
    ) {
      return new TreeNode(null, null, null, null, this._calculateLeafValue(y), this._calculateImpurity(y));
    }

    // Find the optimal feature split
    const split = this._bestSplit(X, y);
    if (split.gain <= 0.0) {
      return new TreeNode(null, null, null, null, this._calculateLeafValue(y), this._calculateImpurity(y));
    }

    // Record feature importance gain
    this.featureImportances[split.feature] += split.gain * nSamples;

    // Split samples
    const leftX = [], leftY = [], rightX = [], rightY = [];
    for (let i = 0; i < nSamples; i++) {
      if (X[i][split.feature] <= split.threshold) {
        leftX.push(X[i]);
        leftY.push(y[i]);
      } else {
        rightX.push(X[i]);
        rightY.push(y[i]);
      }
    }

    // Recurse left and right branches
    const left = this._buildTree(leftX, leftY, depth + 1);
    const right = this._buildTree(rightX, rightY, depth + 1);

    return new TreeNode(split.feature, split.threshold, left, right, null, split.impurity);
  }

  _bestSplit(X, y) {
    const nSamples = X.length;
    const parentImpurity = this._calculateImpurity(y);
    let bestGain = -1;
    let bestFeature = null;
    let bestThreshold = null;

    for (let f = 0; f < this.nFeatures; f++) {
      // Find sorted unique values of this feature
      const values = X.map(row => row[f]);
      const uniqueValues = Array.from(new Set(values)).sort((a, b) => a - b);

      // Evaluate midpoint thresholds
      for (let i = 0; i < uniqueValues.length - 1; i++) {
        const threshold = (uniqueValues[i] + uniqueValues[i + 1]) / 2.0;

        // Split lists
        const leftY = [], rightY = [];
        for (let j = 0; j < nSamples; j++) {
          if (X[j][f] <= threshold) {
            leftY.push(y[j]);
          } else {
            rightY.push(y[j]);
          }
        }

        if (leftY.length === 0 || rightY.length === 0) continue;

        // Compute impurity weight
        const leftImp = this._calculateImpurity(leftY);
        const rightImp = this._calculateImpurity(rightY);
        const childImpurity = (leftY.length / nSamples) * leftImp + (rightY.length / nSamples) * rightImp;

        const gain = parentImpurity - childImpurity;
        if (gain > bestGain) {
          bestGain = gain;
          bestFeature = f;
          bestThreshold = threshold;
        }
      }
    }

    return { feature: bestFeature, threshold: bestThreshold, gain: bestGain, impurity: parentImpurity };
  }

  _calculateImpurity(y) {
    if (y.length === 0) return 0.0;

    if (this.criterion === 'mse') {
      // Variance calculation
      const mean = y.reduce((a, b) => a + b, 0.0) / y.length;
      return y.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0.0) / y.length;
    }

    // Classification criteria: Gini or Entropy
    const counts = new Map();
    for (const label of y) {
      counts.set(label, (counts.get(label) || 0) + 1);
    }

    const nSamples = y.length;
    if (this.criterion === 'gini') {
      let sumSquares = 0.0;
      for (const count of counts.values()) {
        sumSquares += Math.pow(count / nSamples, 2);
      }
      return 1.0 - sumSquares;
    } else if (this.criterion === 'entropy') {
      let entropy = 0.0;
      for (const count of counts.values()) {
        const p = count / nSamples;
        entropy -= p * Math.log2(p);
      }
      return entropy;
    }

    return 0.0;
  }

  _calculateLeafValue(y) {
    if (y.length === 0) return 0.0;

    if (this.criterion === 'mse') {
      // Predict mean for regression
      return y.reduce((a, b) => a + b, 0.0) / y.length;
    }

    // Predict majority label vote for classification
    const counts = new Map();
    let maxCount = -1;
    let majority = null;
    for (const label of y) {
      const c = (counts.get(label) || 0) + 1;
      counts.set(label, c);
      if (c > maxCount) {
        maxCount = c;
        majority = label;
      }
    }
    return majority;
  }

  /**
   * Serialize tree instance to JSON structure.
   */
  toJSON() {
    const serializeNode = (node) => {
      if (!node) return null;
      return {
        feature: node.feature,
        threshold: node.threshold,
        value: node.value,
        impurity: node.impurity,
        left: serializeNode(node.left),
        right: serializeNode(node.right)
      };
    };

    return JSON.stringify({
      criterion: this.criterion,
      maxDepth: this.maxDepth,
      minSamplesSplit: this.minSamplesSplit,
      nFeatures: this.nFeatures,
      featureImportances: Array.from(this.featureImportances),
      root: serializeNode(this.root)
    });
  }

  /**
   * Reconstitute tree from JSON string structure.
   */
  static fromJSON(jsonString) {
    const data = JSON.parse(jsonString);
    const tree = new DecisionTree({
      criterion: data.criterion,
      maxDepth: data.maxDepth,
      minSamplesSplit: data.minSamplesSplit
    });

    const deserializeNode = (nodeData) => {
      if (!nodeData) return null;
      const node = new TreeNode(
        nodeData.feature,
        nodeData.threshold,
        null,
        null,
        nodeData.value,
        nodeData.impurity
      );
      node.left = deserializeNode(nodeData.left);
      node.right = deserializeNode(nodeData.right);
      return node;
    };

    tree.nFeatures = data.nFeatures;
    tree.featureImportances = new Float64Array(data.featureImportances);
    tree.root = deserializeNode(data.root);
    return tree;
  }
}
