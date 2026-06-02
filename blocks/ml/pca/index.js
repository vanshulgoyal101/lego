/**
 * Principal Component Analysis (PCA)
 */
export class PCA {
  /**
   * @param {number} nComponents - Number of target dimensions (components)
   */
  constructor(nComponents) {
    this.nComponents = nComponents;
    this.mean = [];
    this.components = []; // Projection eigenvectors
  }

  /**
   * Fits the PCA model by calculating covariance and extracting principal vectors
   *
   * @param {number[][]} X - Input coordinates dataset [numSamples x numFeatures]
   */
  fit(X) {
    const numSamples = X.length;
    const numFeatures = X[0].length;

    // 1. Calculate column means
    this.mean = new Array(numFeatures).fill(0);
    for (let i = 0; i < numSamples; i++) {
      for (let j = 0; j < numFeatures; j++) {
        this.mean[j] += X[i][j];
      }
    }
    for (let j = 0; j < numFeatures; j++) {
      this.mean[j] /= numSamples;
    }

    // 2. Center the dataset X
    const XCentered = X.map(row => row.map((val, j) => val - this.mean[j]));

    // 3. Compute Covariance Matrix: C = (X_C^T * X_C) / (N - 1)
    const covariance = Array.from({ length: numFeatures }, () => new Float64Array(numFeatures));
    for (let i = 0; i < numFeatures; i++) {
      for (let j = 0; j < numFeatures; j++) {
        let sum = 0;
        for (let k = 0; k < numSamples; k++) {
          sum += XCentered[k][i] * XCentered[k][j];
        }
        covariance[i][j] = sum / (numSamples - 1);
      }
    }

    // 4. Extract eigenvectors using Power Iteration (Simplified mapping for zero-dependency)
    this.components = [];
    let covTemp = covariance.map(row => Float64Array.from(row));

    for (let c = 0; c < this.nComponents; c++) {
      const eigenvector = this._powerIteration(covTemp);
      this.components.push(eigenvector);

      // Deflate matrix: subtract the projection along this eigenvector from covTemp
      for (let i = 0; i < numFeatures; i++) {
        for (let j = 0; j < numFeatures; j++) {
          covTemp[i][j] -= eigenvector[i] * eigenvector[j];
        }
      }
    }
  }

  _powerIteration(matrix, maxIter = 100, tolerance = 1e-9) {
    const n = matrix.length;
    let b = new Float64Array(n).map(() => Math.random() - 0.5);

    // Normalize
    let norm = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    b = b.map(v => v / (norm || 1));

    for (let iter = 0; iter < maxIter; iter++) {
      const nextB = new Float64Array(n);
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
          nextB[i] += matrix[i][j] * b[j];
        }
      }

      const nextNorm = Math.sqrt(nextB.reduce((sum, val) => sum + val * val, 0));
      const nextBUnit = nextB.map(v => v / (nextNorm || 1));

      // Check convergence (dot product close to 1)
      let dot = 0;
      for (let i = 0; i < n; i++) dot += b[i] * nextBUnit[i];

      b = nextBUnit;
      if (Math.abs(dot) > 1 - tolerance) {
        break;
      }
    }
    return b;
  }

  /**
   * Project dataset into lower-dimensional components space
   *
   * @param {number[][]} X
   * @returns {number[][]} Projected coordinates
   */
  transform(X) {
    return X.map(row => {
      const centered = row.map((val, j) => val - this.mean[j]);
      const projection = [];
      for (let c = 0; c < this.nComponents; c++) {
        let sum = 0;
        for (let j = 0; j < row.length; j++) {
          sum += centered[j] * this.components[c][j];
        }
        projection.push(sum);
      }
      return projection;
    });
  }
}
