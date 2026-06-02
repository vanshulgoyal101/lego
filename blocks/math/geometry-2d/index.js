export class Geometry2D {
  static distance(p1, p2) {
    return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
  }

  static lineIntersection(p1, p2, p3, p4) {
    const denom = (p4.y - p3.y) * (p2.x - p1.x) - (p4.x - p3.x) * (p2.y - p1.y);
    if (denom === 0) return null; // Parallel

    const ua = ((p4.x - p3.x) * (p1.y - p3.y) - (p4.y - p3.y) * (p1.x - p3.x)) / denom;
    const ub = ((p2.x - p1.x) * (p1.y - p3.y) - (p2.y - p1.y) * (p1.x - p3.x)) / denom;

    // Check if intersection occurs along both line segments
    if (ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1) {
      return {
        x: p1.x + ua * (p2.x - p1.x),
        y: p1.y + ua * (p2.y - p1.y)
      };
    }
    return null;
  }

  static circleIntersection(c1, r1, c2, r2) {
    const dist = this.distance(c1, c2);

    // No intersection: circles are too far apart or one is inside the other
    if (dist > r1 + r2 || dist < Math.abs(r1 - r2) || dist === 0) {
      return [];
    }

    const a = (r1 ** 2 - r2 ** 2 + dist ** 2) / (2 * dist);
    const h = Math.sqrt(r1 ** 2 - a ** 2);

    // Midpoint between intersection points
    const x2 = c1.x + (a * (c2.x - c1.x)) / dist;
    const y2 = c1.y + (a * (c2.y - c1.y)) / dist;

    // Single tangent intersection point
    if (dist === r1 + r2) {
      return [{ x: x2, y: y2 }];
    }

    // Two intersection points
    return [
      {
        x: x2 + (h * (c2.y - c1.y)) / dist,
        y: y2 - (h * (c2.x - c1.x)) / dist
      },
      {
        x: x2 - (h * (c2.y - c1.y)) / dist,
        y: y2 + (h * (c2.x - c1.x)) / dist
      }
    ];
  }

  static pointInPolygon(point, polygon) {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i].x, yi = polygon[i].y;
      const xj = polygon[j].x, yj = polygon[j].y;

      const intersect = ((yi > point.y) !== (yj > point.y)) &&
        (point.x < ((xj - xi) * (point.y - yi)) / (yj - yi) + xi);

      if (intersect) inside = !inside;
    }
    return inside;
  }

  static boxOverlap(box1, box2) {
    // box: { x, y, width, height }
    return (
      box1.x < box2.x + box2.width &&
      box1.x + box1.width > box2.x &&
      box1.y < box2.y + box2.height &&
      box1.y + box1.height > box2.y
    );
  }
}
