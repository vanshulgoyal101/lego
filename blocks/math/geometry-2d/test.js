import { describe, it, expect } from '../../../test/test-harness.js';
import {Geometry2D} from './index.js';

  await describe('math/geometry-2d', async () => {
    await it('should compute line intersections correctly', () => {
      const p1 = { x: 0, y: 0 }, p2 = { x: 4, y: 4 };
      const p3 = { x: 0, y: 4 }, p4 = { x: 4, y: 0 };
      const intersect = Geometry2D.lineIntersection(p1, p2, p3, p4);
      expect(intersect).toEqual({ x: 2, y: 2 });
    });

    await it('should evaluate point inside polygon correctly', () => {
      const poly = [
        { x: 0, y: 0 },
        { x: 5, y: 0 },
        { x: 5, y: 5 },
        { x: 0, y: 5 }
      ];
      expect(Geometry2D.pointInPolygon({ x: 2, y: 2 }, poly)).toBeTruthy();
      expect(Geometry2D.pointInPolygon({ x: 10, y: 2 }, poly)).toBeFalsy();
    });
  });
