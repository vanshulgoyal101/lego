import { describe, it, expect } from '../../../test/test-harness.js';
import { Octree, BoundingBox } from './index.js';

await describe('ds/octree', async () => {
  await it('should insert points and query ranges correctly', () => {
    const boundary = new BoundingBox(0, 0, 0, 10, 10, 10);
    const octree = new Octree(boundary, 2);

    const p1 = { x: 1, y: 1, z: 1, data: 'A' };
    const p2 = { x: -1, y: -1, z: -1, data: 'B' };
    const p3 = { x: 5, y: 5, z: 5, data: 'C' };
    const p4 = { x: 9, y: 9, z: 9, data: 'D' };

    expect(octree.insert(p1)).toBe(true);
    expect(octree.insert(p2)).toBe(true);
    expect(octree.insert(p3)).toBe(true);
    expect(octree.insert(p4)).toBe(true);

    // Query range enclosing p3 and p4
    const queryRange = new BoundingBox(7, 7, 7, 3, 3, 3);
    const results = octree.query(queryRange);

    expect(results.length).toBe(2);
    const hasC = results.some(p => p.data === 'C');
    const hasD = results.some(p => p.data === 'D');
    expect(hasC).toBe(true);
    expect(hasD).toBe(true);
  });

  await it('should locate the nearest neighbor', () => {
    const boundary = new BoundingBox(0, 0, 0, 100, 100, 100);
    const octree = new Octree(boundary, 2);

    const p1 = { x: 10, y: 10, z: 10, data: 'Close' };
    const p2 = { x: 80, y: 80, z: 80, data: 'Far' };
    const p3 = { x: -20, y: -20, z: -20, data: 'Negative' };

    octree.insert(p1);
    octree.insert(p2);
    octree.insert(p3);

    const target = { x: 12, y: 12, z: 11 };
    const best = octree.nearestNeighbor(target);

    expect(best.point.data).toBe('Close');
    expect(best.dist < 5).toBe(true);
  });
});
