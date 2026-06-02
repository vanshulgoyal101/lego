export class Point {
  constructor(x, y, data = null) {
    this.x = x;
    this.y = y;
    this.data = data;
  }
}

export class Rectangle {
  constructor(x, y, w, h) {
    this.x = x; // center x
    this.y = y; // center y
    this.w = w; // half-width
    this.h = h; // half-height
  }

  contains(point) {
    return (
      point.x >= this.x - this.w &&
      point.x <= this.x + this.w &&
      point.y >= this.y - this.h &&
      point.y <= this.y + this.h
    );
  }

  intersects(range) {
    return !(
      range.x - range.w > this.x + this.w ||
      range.x + range.w < this.x - this.w ||
      range.y - range.h > this.y + this.h ||
      range.y + range.h < this.y - this.h
    );
  }
}

export class QuadTree {
  constructor(boundary, capacity = 4) {
    this.boundary = boundary; // Rectangle instance
    this.capacity = capacity;
    this.points = [];
    this.divided = false;

    this.northwest = null;
    this.northeast = null;
    this.southwest = null;
    this.southeast = null;
  }

  subdivide() {
    const { x, y, w, h } = this.boundary;
    const nw = new Rectangle(x - w / 2, y - h / 2, w / 2, h / 2);
    const ne = new Rectangle(x + w / 2, y - h / 2, w / 2, h / 2);
    const sw = new Rectangle(x - w / 2, y + h / 2, w / 2, h / 2);
    const se = new Rectangle(x + w / 2, y + h / 2, w / 2, h / 2);

    this.northwest = new QuadTree(nw, this.capacity);
    this.northeast = new QuadTree(ne, this.capacity);
    this.southwest = new QuadTree(sw, this.capacity);
    this.southeast = new QuadTree(se, this.capacity);

    this.divided = true;
  }

  insert(point) {
    if (!this.boundary.contains(point)) {
      return false;
    }

    if (this.points.length < this.capacity && !this.divided) {
      this.points.push(point);
      return true;
    }

    if (!this.divided) {
      this.subdivide();
    }

    return (
      this.northwest.insert(point) ||
      this.northeast.insert(point) ||
      this.southwest.insert(point) ||
      this.southeast.insert(point)
    );
  }

  query(range, found = []) {
    if (!this.boundary.intersects(range)) {
      return found;
    }

    for (const p of this.points) {
      if (range.contains(p)) {
        found.push(p);
      }
    }

    if (this.divided) {
      this.northwest.query(range, found);
      this.northeast.query(range, found);
      this.southwest.query(range, found);
      this.southeast.query(range, found);
    }

    return found;
  }
}
