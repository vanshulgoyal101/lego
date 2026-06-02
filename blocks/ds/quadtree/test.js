import { describe, it, expect } from '../../../test/test-harness.js';
import { QuadTree, Rectangle, Point } from './index.js';

await describe('ds/quadtree', async () => {
  await it('should correctly insert points and perform regional queries', () => {
    const boundary = new Rectangle(200, 200, 200, 200);
    const qt = new QuadTree(boundary, 4);

    const p1 = new Point(100, 100, 'A');
    const p2 = new Point(150, 150, 'B');
    const p3 = new Point(300, 300, 'C');
    const p4 = new Point(250, 250, 'D');
    const p5 = new Point(50, 50, 'E');

    expect(qt.insert(p1)).toBe(true);
    expect(qt.insert(p2)).toBe(true);
    expect(qt.insert(p3)).toBe(true);
    expect(qt.insert(p4)).toBe(true);
    expect(qt.insert(p5)).toBe(true);

    const range = new Rectangle(120, 120, 40, 40);
    const results = qt.query(range);

    expect(results.length).toBe(2);
    const names = results.map(r => r.data).sort();
    expect(names).toEqual(['A', 'B']);
  });
});
