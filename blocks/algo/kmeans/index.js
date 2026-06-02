/**
 * Performs K-Means clustering on multi-dimensional numeric arrays.
 * 
 * @param {Array<Array<number>>} data - The dataset to cluster.
 * @param {number} k - The number of clusters to form.
 * @param {number} [maxIterations=100] - Maximum number of iterations.
 * @returns {{centroids: Array<Array<number>>, assignments: Array<number>}} Centroids and cluster assignments index.
 */
export function kmeans(data, k, maxIterations = 100) {
  if (!Array.isArray(data) || data.length === 0) {
    throw new TypeError('Dataset must be a non-empty array of vectors');
  }
  if (k <= 0 || k > data.length) {
    throw new RangeError('k must be greater than 0 and less than or equal to dataset size');
  }

  const dimensions = data[0].length;
  
  // Initialize centroids by randomly picking k unique points from dataset
  const centroids = [];
  const indices = new Set();
  while (centroids.length < k) {
    const idx = Math.floor(Math.random() * data.length);
    if (!indices.has(idx)) {
      indices.add(idx);
      centroids.push([...data[idx]]);
    }
  }

  const assignments = new Array(data.length);
  let changed = true;
  let iterations = 0;

  // Euclidean distance between two vectors
  function distance(v1, v2) {
    let sum = 0;
    for (let i = 0; i < dimensions; i++) {
      const diff = v1[i] - v2[i];
      sum += diff * diff;
    }
    return Math.sqrt(sum);
  }

  while (changed && iterations < maxIterations) {
    changed = false;
    iterations++;

    // 1. Assign points to nearest centroid
    for (let i = 0; i < data.length; i++) {
      const point = data[i];
      let minDistance = Infinity;
      let clusterIdx = -1;

      for (let c = 0; c < k; c++) {
        const dist = distance(point, centroids[c]);
        if (dist < minDistance) {
          minDistance = dist;
          clusterIdx = c;
        }
      }

      if (assignments[i] !== clusterIdx) {
        assignments[i] = clusterIdx;
        changed = true;
      }
    }

    // 2. Re-calculate centroids
    if (changed) {
      const counts = new Array(k).fill(0);
      const sums = Array.from({ length: k }, () => new Array(dimensions).fill(0));

      for (let i = 0; i < data.length; i++) {
        const clusterIdx = assignments[i];
        counts[clusterIdx]++;
        for (let d = 0; d < dimensions; d++) {
          sums[clusterIdx][d] += data[i][d];
        }
      }

      for (let c = 0; c < k; c++) {
        if (counts[c] > 0) {
          for (let d = 0; d < dimensions; d++) {
            centroids[c][d] = sums[c][d] / counts[c];
          }
        }
      }
    }
  }

  return { centroids, assignments };
}
