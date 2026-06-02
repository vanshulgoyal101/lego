/**
 * K-Nearest Neighbors (KNN) Classifier and Regressor
 * Supports Euclidean, Manhattan, and Cosine distance metrics, uniform/distance weighting, and optional standardization.
 */

export class KNN {
  /**
   * @param {Object} options
   * @param {number} [options.k=3] - Number of neighbors
   * @param {string} [options.distanceMetric='euclidean'] - 'euclidean', 'manhattan', 'cosine'
   * @param {string} [options.weighting='uniform'] - 'uniform' or 'distance' (inverse distance)
   * @param {boolean} [options.standardize=false] - If true, scales features using training stats
   */
  constructor(options = {}) {
    this.k = options.k !== undefined ? options.k : 3;
    this.distanceMetric = options.distanceMetric || 'euclidean';
    this.weighting = options.weighting || 'uniform';
    this.standardize = options.standardize || false;
    
    this.trainX = [];
    this.trainY = [];
    this.means = [];
    this.stds = [];
  }

  /**
   * Train/Fit the model on datasets.
   * @param {Array<Array<number>>} X - Feature matrix of shape (n_samples, n_features)
   * @param {Array<any>} y - Target values
   */
  fit(X, y) {
    if (!X || X.length === 0 || !y || y.length === 0) {
      throw new Error('Training data X and labels y must be non-empty arrays.');
    }
    if (X.length !== y.length) {
      throw new Error('Length of X and y must match.');
    }
    
    const nFeatures = X[0].length;
    
    // Calculate stats if standardization is active
    if (this.standardize) {
      this.means = Array(nFeatures).fill(0);
      this.stds = Array(nFeatures).fill(0);
      
      // Calculate means
      for (let j = 0; j < nFeatures; j++) {
        let sum = 0;
        for (let i = 0; i < X.length; i++) {
          sum += X[i][j];
        }
        this.means[j] = sum / X.length;
      }
      
      // Calculate standard deviations
      for (let j = 0; j < nFeatures; j++) {
        let varianceSum = 0;
        for (let i = 0; i < X.length; i++) {
          varianceSum += Math.pow(X[i][j] - this.means[j], 2);
        }
        this.stds[j] = Math.sqrt(varianceSum / X.length);
        if (this.stds[j] === 0) this.stds[j] = 1; // Prevent division by zero
      }
      
      // Standardize training set
      this.trainX = X.map(row => this._scaleRow(row));
    } else {
      // Copy array reference/values
      this.trainX = X.map(row => [...row]);
    }
    
    this.trainY = [...y];
  }

  /**
   * Predict values/classes for input matrix.
   * @param {Array<Array<number>>} X - Predict matrix
   * @param {boolean} [regression=false] - If true, computes continuous regression; else classification
   * @returns {Array<any>} - Predictions
   */
  predict(X, regression = false) {
    if (this.trainX.length === 0) {
      throw new Error('Model is not fitted. Call fit() first.');
    }
    return X.map(row => this._predictRow(row, regression));
  }

  _scaleRow(row) {
    return row.map((val, idx) => (val - this.means[idx]) / this.stds[idx]);
  }

  _calculateDistance(p1, p2) {
    if (p1.length !== p2.length) {
      throw new Error('Dimensions of comparison vectors do not match.');
    }

    switch (this.distanceMetric.toLowerCase()) {
      case 'manhattan': {
        let sum = 0;
        for (let i = 0; i < p1.length; i++) {
          sum += Math.abs(p1[i] - p2[i]);
        }
        return sum;
      }
      case 'cosine': {
        let dot = 0;
        let norm1 = 0;
        let norm2 = 0;
        for (let i = 0; i < p1.length; i++) {
          dot += p1[i] * p2[i];
          norm1 += p1[i] * p1[i];
          norm2 += p2[i] * p2[i];
        }
        if (norm1 === 0 || norm2 === 0) return 1; // Max distance if zero vector
        return 1 - (dot / (Math.sqrt(norm1) * Math.sqrt(norm2)));
      }
      case 'euclidean':
      default: {
        let sum = 0;
        for (let i = 0; i < p1.length; i++) {
          sum += Math.pow(p1[i] - p2[i], 2);
        }
        return Math.sqrt(sum);
      }
    }
  }

  _predictRow(row, regression) {
    const targetRow = this.standardize ? this._scaleRow(row) : row;
    
    // Compute distance to all training samples
    const distances = this.trainX.map((trainRow, index) => {
      return {
        index,
        distance: this._calculateDistance(targetRow, trainRow),
        label: this.trainY[index]
      };
    });

    // Sort ascending by distance
    distances.sort((a, b) => a.distance - b.distance);

    // Take top K nearest
    const nearest = distances.slice(0, Math.min(this.k, distances.length));

    // Handle Regression
    if (regression) {
      if (this.weighting === 'distance') {
        let weightSum = 0;
        let valueSum = 0;
        for (const item of nearest) {
          const w = 1 / (item.distance + 1e-5);
          valueSum += item.label * w;
          weightSum += w;
        }
        return valueSum / weightSum;
      } else {
        // Uniform
        const sum = nearest.reduce((acc, item) => acc + item.label, 0);
        return sum / nearest.length;
      }
    }

    // Handle Classification
    const votes = new Map();
    for (const item of nearest) {
      const weight = this.weighting === 'distance' ? (1 / (item.distance + 1e-5)) : 1;
      votes.set(item.label, (votes.get(item.label) || 0) + weight);
    }

    let bestLabel = null;
    let maxVote = -Infinity;
    for (const [label, vote] of votes.entries()) {
      if (vote > maxVote) {
        maxVote = vote;
        bestLabel = label;
      }
    }

    return bestLabel;
  }
}
