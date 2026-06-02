/**
 * Exact Fraction Arithmetic
 *
 * Provides a Fraction class for exact rational number math using integer
 * numerator/denominator pairs, with automatic simplification via GCD.
 */

/**
 * Compute the greatest common divisor of two integers using Euclidean algorithm.
 * @param {number} a
 * @param {number} b
 * @returns {number}
 */
function gcd(a, b) {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b !== 0) {
    [a, b] = [b, a % b];
  }
  return a;
}

/**
 * Represents an exact rational number p/q.
 *
 * All arithmetic operations return new Fraction instances.
 * Fractions are kept in a canonical form where the denominator is always
 * positive (the sign lives in the numerator).
 *
 * @example
 * const a = new Fraction(1, 2);
 * const b = new Fraction(1, 3);
 * a.add(b).toString(); // '5/6'
 */
export class Fraction {
  /**
   * @param {number} numerator   - Integer numerator
   * @param {number} denominator - Non-zero integer denominator
   */
  constructor(numerator, denominator = 1) {
    if (!Number.isInteger(numerator) || !Number.isInteger(denominator)) {
      throw new TypeError('Fraction: numerator and denominator must be integers');
    }
    if (denominator === 0) {
      throw new RangeError('Fraction: denominator cannot be zero');
    }
    this.numerator = numerator;
    this.denominator = denominator;
    // Canonicalize: denominator always positive
    if (this.denominator < 0) {
      this.numerator = -this.numerator;
      this.denominator = -this.denominator;
    }
  }

  // ─── Arithmetic ────────────────────────────────────────────────────────────

  /**
   * Add another fraction: a/b + c/d = (ad + bc) / bd
   * @param {Fraction} f
   * @returns {Fraction}
   */
  add(f) {
    return new Fraction(
      this.numerator * f.denominator + f.numerator * this.denominator,
      this.denominator * f.denominator
    ).simplify();
  }

  /**
   * Subtract another fraction: a/b - c/d = (ad - bc) / bd
   * @param {Fraction} f
   * @returns {Fraction}
   */
  sub(f) {
    return new Fraction(
      this.numerator * f.denominator - f.numerator * this.denominator,
      this.denominator * f.denominator
    ).simplify();
  }

  /**
   * Multiply by another fraction: (a/b) * (c/d) = ac / bd
   * @param {Fraction} f
   * @returns {Fraction}
   */
  mul(f) {
    return new Fraction(
      this.numerator * f.numerator,
      this.denominator * f.denominator
    ).simplify();
  }

  /**
   * Divide by another fraction: (a/b) / (c/d) = ad / bc
   * @param {Fraction} f
   * @returns {Fraction}
   */
  div(f) {
    if (f.numerator === 0) throw new RangeError('Fraction: division by zero');
    return new Fraction(
      this.numerator * f.denominator,
      this.denominator * f.numerator
    ).simplify();
  }

  // ─── Utilities ─────────────────────────────────────────────────────────────

  /**
   * Return a new Fraction reduced to lowest terms.
   * @returns {Fraction}
   */
  simplify() {
    const g = gcd(Math.abs(this.numerator), this.denominator);
    return new Fraction(this.numerator / g, this.denominator / g);
  }

  /**
   * Convert to a floating-point decimal value.
   * @returns {number}
   */
  toDecimal() {
    return this.numerator / this.denominator;
  }

  /**
   * Return string representation in "p/q" form (or just "p" for whole numbers).
   * @returns {string}
   */
  toString() {
    const s = this.simplify();
    if (s.denominator === 1) return String(s.numerator);
    return `${s.numerator}/${s.denominator}`;
  }

  /**
   * Test equality with another Fraction.
   * @param {Fraction} f
   * @returns {boolean}
   */
  equals(f) {
    const a = this.simplify();
    const b = f.simplify();
    return a.numerator === b.numerator && a.denominator === b.denominator;
  }

  /**
   * Compare with another Fraction. Returns negative, 0, or positive.
   * @param {Fraction} f
   * @returns {number}
   */
  compare(f) {
    return this.numerator * f.denominator - f.numerator * this.denominator;
  }

  /**
   * Return the absolute value as a new Fraction.
   * @returns {Fraction}
   */
  abs() {
    return new Fraction(Math.abs(this.numerator), this.denominator);
  }

  /**
   * Return the negation as a new Fraction.
   * @returns {Fraction}
   */
  neg() {
    return new Fraction(-this.numerator, this.denominator);
  }
}
