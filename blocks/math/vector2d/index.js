/**
 * A comprehensive 2D mathematical vector representation.
 * Useful for geometry algorithms, physics engines, and canvas animations.
 */
export class Vector2D {
  /**
   * @param {number} [x=0]
   * @param {number} [y=0]
   */
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  /**
   * Add another vector and return a new vector.
   * @param {Vector2D} v
   * @returns {Vector2D}
   */
  add(v) {
    return new Vector2D(this.x + v.x, this.y + v.y);
  }

  /**
   * Subtract another vector and return a new vector.
   * @param {Vector2D} v
   * @returns {Vector2D}
   */
  sub(v) {
    return new Vector2D(this.x - v.x, this.y - v.y);
  }

  /**
   * Scale the vector by a scalar amount.
   * @param {number} scalar
   * @returns {Vector2D}
   */
  scale(scalar) {
    return new Vector2D(this.x * scalar, this.y * scalar);
  }

  /**
   * Calculate dot product with another vector.
   * @param {Vector2D} v
   * @returns {number}
   */
  dot(v) {
    return this.x * v.x + this.y * v.y;
  }

  /**
   * Calculate cross product with another vector (2D determinant).
   * @param {Vector2D} v
   * @returns {number}
   */
  cross(v) {
    return this.x * v.y - this.y * v.x;
  }

  /**
   * Calculate vector magnitude (length).
   * @returns {number}
   */
  magnitude() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  /**
   * Return a normalized (unit length) copy of this vector.
   * @returns {Vector2D}
   */
  normalize() {
    const mag = this.magnitude();
    if (mag === 0) {
      return new Vector2D(0, 0);
    }
    return this.scale(1 / mag);
  }

  /**
   * Distance between this vector position and another vector.
   * @param {Vector2D} v
   * @returns {number}
   */
  distance(v) {
    return Math.sqrt((this.x - v.x) ** 2 + (this.y - v.y) ** 2);
  }

  /**
   * Angle of the vector in radians relative to the positive X-axis.
   * @returns {number}
   */
  angle() {
    return Math.atan2(this.y, this.x);
  }

  /**
   * Return a clone.
   * @returns {Vector2D}
   */
  clone() {
    return new Vector2D(this.x, this.y);
  }
}
