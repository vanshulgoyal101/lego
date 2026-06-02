export class KDNode {
  constructor(point, axis, left = null, right = null) {
    this.point = point;
    this.axis = axis;
    this.left = left;
    this.right = right;
  }
}

export class KDTree {
  constructor(points = [], dimensions) {
    this.dimensions = dimensions;
    this.root = this.build(points, 0);
  }

  build(points, depth) {
    if (points.length === 0) {
      return null;
    }

    const axis = depth % this.dimensions;

    // Sort points by the coordinate at current axis
    points.sort((a, b) => a[axis] - b[axis]);

    const medianIndex = Math.floor(points.length / 2);
    const medianPoint = points[medianIndex];

    return new KDNode(
      medianPoint,
      axis,
      this.build(points.slice(0, medianIndex), depth + 1),
      this.build(points.slice(medianIndex + 1), depth + 1)
    );
  }

  insert(point) {
    const insertNode = (node, depth) => {
      if (!node) {
        return new KDNode(point, depth % this.dimensions);
      }

      const axis = node.axis;
      if (point[axis] < node.point[axis]) {
        node.left = insertNode(node.left, depth + 1);
      } else {
        node.right = insertNode(node.right, depth + 1);
      }
      return node;
    };

    this.root = insertNode(this.root, 0);
  }

  nearestNeighbor(target) {
    let bestNode = null;
    let bestDist = Infinity;

    const distance = (a, b) => {
      let sum = 0;
      for (let i = 0; i < this.dimensions; i++) {
        sum += (a[i] - b[i]) ** 2;
      }
      return Math.sqrt(sum);
    };

    const search = (node) => {
      if (!node) return;

      const dist = distance(target, node.point);
      if (dist < bestDist) {
        bestDist = dist;
        bestNode = node.point;
      }

      const axis = node.axis;
      const diff = target[axis] - node.point[axis];

      const nextNode = diff < 0 ? node.left : node.right;
      const otherNode = diff < 0 ? node.right : node.left;

      // Search down the closer subtree
      search(nextNode);

      // Check if we need to search the other subtree
      if (Math.abs(diff) < bestDist) {
        search(otherNode);
      }
    };

    search(this.root);
    return bestNode;
  }
}
