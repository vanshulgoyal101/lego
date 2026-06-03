export class Quaternion {
  constructor(w = 1, x = 0, y = 0, z = 0) {
    this.w = w;
    this.x = x;
    this.y = y;
    this.z = z;
  }

  add(q) {
    return new Quaternion(
      this.w + q.w,
      this.x + q.x,
      this.y + q.y,
      this.z + q.z
    );
  }

  scale(s) {
    return new Quaternion(
      this.w * s,
      this.x * s,
      this.y * s,
      this.z * s
    );
  }

  multiply(q) {
    return new Quaternion(
      this.w * q.w - this.x * q.x - this.y * q.y - this.z * q.z,
      this.w * q.x + this.x * q.w + this.y * q.z - this.z * q.y,
      this.w * q.y - this.x * q.z + this.y * q.w + this.z * q.x,
      this.w * q.z + this.x * q.y - this.y * q.x + this.z * q.w
    );
  }

  conjugate() {
    return new Quaternion(this.w, -this.x, -this.y, -this.z);
  }

  norm() {
    return Math.sqrt(
      this.w * this.w + this.x * this.x + this.y * this.y + this.z * this.z
    );
  }

  normalize() {
    const n = this.norm();
    if (n === 0) {
      return new Quaternion(1, 0, 0, 0);
    }
    return this.scale(1 / n);
  }

  inverse() {
    const n2 = this.w * this.w + this.x * this.x + this.y * this.y + this.z * this.z;
    if (n2 === 0) {
      throw new Error('Zero quaternion has no inverse');
    }
    return this.conjugate().scale(1 / n2);
  }

  rotateVector(v) {
    // q * v * q^-1 where v is treated as pure quaternion (0, vx, vy, vz)
    const qv = new Quaternion(0, v.x, v.y, v.z);
    const result = this.multiply(qv).multiply(this.inverse());
    return { x: result.x, y: result.y, z: result.z };
  }

  static fromAxisAngle(axis, angle) {
    const halfAngle = angle / 2;
    const s = Math.sin(halfAngle);
    const len = Math.sqrt(axis.x * axis.x + axis.y * axis.y + axis.z * axis.z);
    if (len === 0) {
      return new Quaternion(1, 0, 0, 0);
    }
    return new Quaternion(
      Math.cos(halfAngle),
      (axis.x / len) * s,
      (axis.y / len) * s,
      (axis.z / len) * s
    ).normalize();
  }

  static fromEuler(yaw, pitch, roll) {
    // ZYX rotation order
    const cy = Math.cos(yaw * 0.5);
    const sy = Math.sin(yaw * 0.5);
    const cp = Math.cos(pitch * 0.5);
    const sp = Math.sin(pitch * 0.5);
    const cr = Math.cos(roll * 0.5);
    const sr = Math.sin(roll * 0.5);

    return new Quaternion(
      cr * cp * cy + sr * sp * sy,
      sr * cp * cy - cr * sp * sy,
      cr * sp * cy + sr * cp * sy,
      cr * cp * sy - sr * sp * cy
    );
  }

  toEuler() {
    // Roll (x-axis rotation)
    const sinr_cosp = 2 * (this.w * this.x + this.y * this.z);
    const cosr_cosp = 1 - 2 * (this.x * this.x + this.y * this.y);
    const roll = Math.atan2(sinr_cosp, cosr_cosp);

    // Pitch (y-axis rotation)
    const sinp = 2 * (this.w * this.y - this.z * this.x);
    let pitch;
    if (Math.abs(sinp) >= 1) {
      pitch = (Math.sign(sinp) * Math.PI) / 2; // use 90 degrees if out of range
    } else {
      pitch = Math.asin(sinp);
    }

    // Yaw (z-axis rotation)
    const siny_cosp = 2 * (this.w * this.z + this.x * this.y);
    const cosy_cosp = 1 - 2 * (this.y * this.y + this.z * this.z);
    const yaw = Math.atan2(siny_cosp, cosy_cosp);

    return { yaw, pitch, roll };
  }

  slerp(q, t) {
    let dot = this.w * q.w + this.x * q.x + this.y * q.y + this.z * q.z;

    let target = q;
    if (dot < 0) {
      dot = -dot;
      target = new Quaternion(-q.w, -q.x, -q.y, -q.z);
    }

    if (dot > 0.9995) {
      // Linear interpolation for very close orientations
      return this.scale(1 - t).add(target.scale(t)).normalize();
    }

    const theta0 = Math.acos(dot);
    const theta = theta0 * t;

    const s0 = Math.sin(theta0 - theta) / Math.sin(theta0);
    const s1 = Math.sin(theta) / Math.sin(theta0);

    return this.scale(s0).add(target.scale(s1));
  }
}
