/**
 * Density-Based Spatial Clustering of Applications with Noise (DBSCAN)
 */
export class DBSCAN {
  /**
   * @param {number} [eps=1.0] - Maximum neighborhood search radius distance
   * @param {number} [minPts=5] - Min points required to define a core density point
   */
  constructor(eps = 1.0, minPts = 5) {
    this.eps = eps;
    this.minPts = minPts;
  }

  /**
   * Run clustering on features input
   *
   * @param {number[][]} X - Point coordinates list
   * @returns {number[]} Parallel list of labels: cluster index integer (0, 1, 2...) or -1 for noise
   */
  fit(X) {
    const n = X.length;
    const labels = new Array(n).fill(undefined); // undefined indicates unvisited
    let clusterId = 0;

    const getNeighbors = (pointIdx) => {
      const neighbors = [];
      const pt = X[pointIdx];
      for (let i = 0; i < n; i++) {
        if (this._distance(pt, X[i]) <= this.eps) {
          neighbors.push(i);
        }
      }
      return neighbors;
    };

    for (let i = 0; i < n; i++) {
      if (labels[i] !== undefined) continue;

      const neighbors = getNeighbors(i);
      if (neighbors.length < this.minPts) {
        labels[i] = -1; // Mark noise initially
        continue;
      }

      labels[i] = clusterId;
      const seedQueue = neighbors.filter(idx => idx !== i);

      for (let j = 0; j < seedQueue.length; j++) {
        const neighborIdx = seedQueue[j];

        if (labels[neighborIdx] === -1) {
          labels[neighborIdx] = clusterId; // Promote noise to border point
        }

        if (labels[neighborIdx] !== undefined) continue;

        labels[neighborIdx] = clusterId;
        const neighborNeighbors = getNeighbors(neighborIdx);
        if (neighborNeighbors.length >= this.minPts) {
          for (const nn of neighborNeighbors) {
            if (!seedQueue.includes(nn)) {
              seedQueue.push(nn);
            }
          }
        }
      }

      clusterId++;
    }

    return labels;
  }

  _distance(a, b) {
    let sum = 0;
    for (let i = 0; i < a.length; i++) {
      sum += (a[i] - b[i]) ** 2;
    }
    return Math.sqrt(sum);
  }
}
