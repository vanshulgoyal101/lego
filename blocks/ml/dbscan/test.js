import { describe, it, expect } from '../../../test/test-harness.js';
import { DBSCAN } from './index.js';

await describe('ml/dbscan', async () => {
  await it('should group dense points and mark isolated ones as noise', () => {
    // Cluster 1: centered around [0, 0]
    // Cluster 2: centered around [10, 10]
    // Noise point: [5, 5]
    const X = [
      [0.1, 0.1], [0.2, 0.2], [0.1, 0.2], [0.2, 0.1], [0.0, 0.0],
      [10.1, 10.1], [10.2, 10.2], [10.1, 10.2], [10.2, 10.1], [10.0, 10.0],
      [5.0, 5.0]
    ];

    const dbscan = new DBSCAN(1.0, 3);
    const labels = dbscan.fit(X);

    // X[10] (which is [5.0, 5.0]) should be noise (-1)
    expect(labels[10]).toBe(-1);

    // The first 5 points should be in the same cluster (e.g. cluster 0)
    const cluster1Id = labels[0];
    expect(cluster1Id !== -1).toBe(true);
    for (let i = 0; i < 5; i++) {
      expect(labels[i]).toBe(cluster1Id);
    }

    // The next 5 points should be in a different cluster (e.g. cluster 1)
    const cluster2Id = labels[5];
    expect(cluster2Id !== -1).toBe(true);
    expect(cluster2Id !== cluster1Id).toBe(true);
    for (let i = 5; i < 10; i++) {
      expect(labels[i]).toBe(cluster2Id);
    }
  });
});
