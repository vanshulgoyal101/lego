export class BoundingBox {
  constructor(x, y, z, hx, hy, hz) {
    this.x = x;   // Center X
    this.y = y;   // Center Y
    this.z = z;   // Center Z
    this.hx = hx; // Half width (X)
    this.hy = hy; // Half height (Y)
    this.hz = hz; // Half depth (Z)
  }

  contains(point) {
    return (
      point.x >= this.x - this.hx &&
      point.x <= this.x + this.hx &&
      point.y >= this.y - this.hy &&
      point.y <= this.y + this.hy &&
      point.z >= this.z - this.hz &&
      point.z <= this.z + this.hz
    );
  }

  intersects(other) {
    return (
      Math.abs(this.x - other.x) <= this.hx + other.hx &&
      Math.abs(this.y - other.y) <= this.hy + other.hy &&
      Math.abs(this.z - other.z) <= this.hz + other.hz
    );
  }
}

export class Octree {
  constructor(boundary, capacity = 4) {
    this.boundary = boundary;
    this.capacity = capacity;
    this.points = [];
    this.divided = false;
    this.children = [];
  }

  subdivide() {
    const { x, y, z, hx, hy, hz } = this.boundary;
    const nhx = hx / 2;
    const nhy = hy / 2;
    const nhz = hz / 2;

    // Create 8 octants
    this.children = [
      new Octree(new BoundingBox(x - nhx, y - nhy, z - nhz, nhx, nhy, nhz), this.capacity),
      new Octree(new BoundingBox(x + nhx, y - nhy, z - nhz, nhx, nhy, nhz), this.capacity),
      new Octree(new BoundingBox(x - nhx, y + nhy, z - nhz, nhx, nhy, nhz), this.capacity),
      new Octree(new BoundingBox(x + nhx, y + nhy, z - nhz, nhx, nhy, nhz), this.capacity),
      new Octree(new BoundingBox(x - nhx, y - nhy, z + nhz, nhx, nhy, nhz), this.capacity),
      new Octree(new BoundingBox(x + nhx, y - nhy, z + nhz, nhx, nhy, nhz), this.capacity),
      new Octree(new BoundingBox(x - nhx, y + nhy, z + nhz, nhx, nhy, nhz), this.capacity),
      new Octree(new BoundingBox(x + nhx, y + nhy, z + nhz, nhx, nhy, nhz), this.capacity)
    ];

    this.divided = true;

    // Distribute existing points to children
    for (const point of this.points) {
      this.insertToChildren(point);
    }
    this.points = [];
  }

  insertToChildren(point) {
    for (const child of this.children) {
      if (child.boundary.contains(point)) {
        child.insert(point);
        return true;
      }
    }
    return false;
  }

  insert(point) {
    if (!this.boundary.contains(point)) {
      return false;
    }

    if (!this.divided) {
      if (this.points.length < this.capacity) {
        this.points.push(point);
        return true;
      }
      this.subdivide();
    }

    return this.insertToChildren(point);
  }

  query(range, found = []) {
    if (!this.boundary.intersects(range)) {
      return found;
    }

    if (this.divided) {
      for (const child of this.children) {
        child.query(range, found);
      }
    } else {
      for (const point of this.points) {
        if (range.contains(point)) {
          found.push(point);
        }
      }
    }

    return found;
  }

  nearestNeighbor(target, best = { point: null, dist: Infinity }) {
    // Determine distance from target point to this node's boundary box
    const distToBox = this.distanceToBoundary(target);
    if (distToBox >= best.dist) {
      return best;
    }

    if (this.divided) {
      // Sort children by distance to target to search closest octants first
      const sortedChildren = this.children
        .map(child => ({ child, dist: child.distanceToBoundary(target) }))
        .sort((a, b) => a.dist - b.dist);

      for (const { child } of sortedChildren) {
        child.nearestNeighbor(target, best);
      }
    } else {
      for (const point of this.points) {
        const dx = point.x - target.x;
        const dy = point.y - target.y;
        const dz = point.z - target.z;
        const d = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (d < best.dist) {
          best.dist = d;
          best.point = point;
        }
      }
    }

    return best;
  }

  distanceToBoundary(point) {
    const { x, y, z, hx, hy, hz } = this.boundary;
    const dx = Math.max(0, Math.abs(point.x - x) - hx);
    const dy = Math.max(0, Math.abs(point.y - y) - hy);
    const dz = Math.max(0, Math.abs(point.z - z) - hz);
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }
}
