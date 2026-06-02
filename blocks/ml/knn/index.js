/**
 * K-Nearest Neighbors Classifier and Regressor
 */
export class KNN {
  /**
   * @param {number} [k=3] - Number of neighbors
   * @param {string} [metric='euclidean'] - 'euclidean' | 'manhattan' | 'chebyshev'
   */
  constructor(k = 3, metric = 'euclidean') {
    this.k = k;
    this.metric = metric;
    this.trainX = [];
    this.trainY = [];
  }

  /**
   * Fit/train the model
   * @param {number[][]} X - Multi-dimensional features
   * @param {Array} y - Labels or target numeric values
   */
  fit(X, y) {
    this.trainX = X;
    this.trainY = y;
  }

  _distance(a, b) {
    let sum = 0;
    if (this.metric === 'manhattan') {
      for (let i = 0; i < a.length; i++) {
        sum += Math.abs(a[i] - b[i]);
      }
      return sum;
    } else if (this.metric === 'chebyshev') {
      let max = 0;
      for (let i = 0; i < a.length; i++) {
        max = Math.max(max, Math.abs(a[i] - b[i]));
      }
      return max;
    } else {
      // Euclidean
      for (let i = 0; i < a.length; i++) {
        sum += (a[i] - b[i]) ** 2;
      }
      return Math.sqrt(sum);
    }
  }

  /**
   * Predict classification labels or regression targets
   * @param {number[][]} X - Features to predict
   * @param {boolean} [regression=false] - If true, performs regression average instead of mode vote
   * @returns {Array} Array of predictions
   */
  predict(X, regression = false) {
    return X.map(item => {
      // Compute distances to all trained items
      const distances = this.trainX.map((trainItem, idx) => ({
        dist: this._distance(item, trainItem),
        label: this.trainY[idx]
      }));

      // Sort by distance ascending
      distances.sort((a, b) => a.dist - b.dist);

      // Take top K
      const nearest = distances.slice(0, this.k);

      if (regression) {
        // Average
        const sum = nearest.reduce((acc, cur) => acc + Number(cur.label), 0);
        return sum / this.k;
      } else {
        // Majority Vote (Mode)
        const votes = {};
        let bestLabel = null;
        let maxVotes = -1;
        for (const n of nearest) {
          votes[n.label] = (votes[n.label] || 0) + 1;
          if (votes[n.label] > maxVotes) {
            maxVotes = votes[n.label];
            bestLabel = n.label;
          }
        }
        return bestLabel;
      }
    });
  }
}
