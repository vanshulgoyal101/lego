/**
 * Complex Number Arithmetic Library
 * Full-featured complex number class with arithmetic, transcendental functions.
 */

export class Complex {
  /**
   * @param {number} re - Real part
   * @param {number} im - Imaginary part
   */
  constructor(re, im = 0) {
    this.re = re;
    this.im = im;
  }

  // ===== Static factories =====

  /** Create from polar form: r * e^(i*theta) */
  static fromPolar(r, theta) {
    return new Complex(r * Math.cos(theta), r * Math.sin(theta));
  }

  /** Create from a real number */
  static fromReal(n) { return new Complex(n, 0); }

  /** The imaginary unit i */
  static get I() { return new Complex(0, 1); }

  /** The real zero */
  static get ZERO() { return new Complex(0, 0); }

  /** The real one */
  static get ONE() { return new Complex(1, 0); }

  // ===== Basic Arithmetic =====

  add(other) {
    other = Complex.from(other);
    return new Complex(this.re + other.re, this.im + other.im);
  }

  sub(other) {
    other = Complex.from(other);
    return new Complex(this.re - other.re, this.im - other.im);
  }

  mul(other) {
    other = Complex.from(other);
    return new Complex(
      this.re * other.re - this.im * other.im,
      this.re * other.im + this.im * other.re
    );
  }

  div(other) {
    other = Complex.from(other);
    const denom = other.re * other.re + other.im * other.im;
    if (denom === 0) throw new Error('Complex division by zero');
    return new Complex(
      (this.re * other.re + this.im * other.im) / denom,
      (this.im * other.re - this.re * other.im) / denom
    );
  }

  neg() { return new Complex(-this.re, -this.im); }

  /** Modulus / absolute value |z| */
  abs() { return Math.sqrt(this.re * this.re + this.im * this.im); }

  /** Argument / phase angle in radians */
  arg() { return Math.atan2(this.im, this.re); }

  /** Complex conjugate */
  conjugate() { return new Complex(this.re, -this.im); }

  // ===== Power and Roots =====

  /**
   * Complex power: z^n (n can be Complex or real number)
   * Uses: z^n = exp(n * ln(z))
   */
  pow(n) {
    if (this.re === 0 && this.im === 0) {
      return new Complex(0);
    }
    n = Complex.from(n);
    return this.ln().mul(n).exp();
  }

  /** Square root of complex number */
  sqrt() {
    const r = this.abs();
    const sign = this.im >= 0 ? 1 : -1;
    return new Complex(
      Math.sqrt((r + this.re) / 2),
      sign * Math.sqrt((r - this.re) / 2)
    );
  }

  // ===== Transcendental Functions =====

  /** e^z */
  exp() {
    const expRe = Math.exp(this.re);
    return new Complex(expRe * Math.cos(this.im), expRe * Math.sin(this.im));
  }

  /** Natural logarithm: ln(z) */
  ln() {
    return new Complex(Math.log(this.abs()), this.arg());
  }

  /** sin(z) = (e^(iz) - e^(-iz)) / (2i) */
  sin() {
    return new Complex(
      Math.sin(this.re) * Math.cosh(this.im),
      Math.cos(this.re) * Math.sinh(this.im)
    );
  }

  /** cos(z) = (e^(iz) + e^(-iz)) / 2 */
  cos() {
    return new Complex(
      Math.cos(this.re) * Math.cosh(this.im),
      -Math.sin(this.re) * Math.sinh(this.im)
    );
  }

  /** tan(z) = sin(z) / cos(z) */
  tan() {
    return this.sin().div(this.cos());
  }

  /** sinh(z) */
  sinh() {
    return new Complex(
      Math.sinh(this.re) * Math.cos(this.im),
      Math.cosh(this.re) * Math.sin(this.im)
    );
  }

  /** cosh(z) */
  cosh() {
    return new Complex(
      Math.cosh(this.re) * Math.cos(this.im),
      Math.sinh(this.re) * Math.sin(this.im)
    );
  }

  // ===== Comparison & Utilities =====

  equals(other, epsilon = 1e-10) {
    other = Complex.from(other);
    return Math.abs(this.re - other.re) < epsilon && Math.abs(this.im - other.im) < epsilon;
  }

  isReal(epsilon = 1e-10) { return Math.abs(this.im) < epsilon; }

  /** Convert to string form like "3 + 2i" */
  toString(precision = 6) {
    const re = parseFloat(this.re.toPrecision(precision));
    const im = parseFloat(this.im.toPrecision(precision));
    if (im === 0) return `${re}`;
    if (re === 0) return `${im}i`;
    return `${re} ${im < 0 ? '-' : '+'} ${Math.abs(im)}i`;
  }

  /** Convert to polar notation { r, theta } */
  toPolar() {
    return { r: this.abs(), theta: this.arg() };
  }

  // Internal coercion: accepts number or Complex
  static from(value) {
    if (value instanceof Complex) return value;
    if (typeof value === 'number') return new Complex(value, 0);
    throw new TypeError(`Cannot convert ${typeof value} to Complex`);
  }
}
