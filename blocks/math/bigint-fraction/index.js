/**
 * Arbitrary-precision rational math library using BigInt.
 */

function gcd(a, b) {
  let x = a < 0n ? -a : a;
  let y = b < 0n ? -b : b;
  while (y > 0n) {
    const temp = y;
    y = x % y;
    x = temp;
  }
  return x;
}

export class BigIntFraction {
  /**
   * @param {bigint|number|string} numerator
   * @param {bigint|number|string} [denominator=1n]
   */
  constructor(numerator, denominator = 1n) {
    let num = BigInt(numerator);
    let den = BigInt(denominator);

    if (den === 0n) {
      throw new Error('DivisionByZero: Denominator cannot be zero');
    }

    // Canonical representation: denominator is always positive
    if (den < 0n) {
      num = -num;
      den = -den;
    }

    // Simplify fraction
    const divisor = gcd(num, den);
    this.num = num / divisor;
    this.den = den / divisor;
  }

  /**
   * Adds two fractions.
   * @param {BigIntFraction} other
   * @returns {BigIntFraction}
   */
  add(other) {
    const num = this.num * other.den + other.num * this.den;
    const den = this.den * other.den;
    return new BigIntFraction(num, den);
  }

  /**
   * Subtracts two fractions.
   * @param {BigIntFraction} other
   * @returns {BigIntFraction}
   */
  subtract(other) {
    const num = this.num * other.den - other.num * this.den;
    const den = this.den * other.den;
    return new BigIntFraction(num, den);
  }

  /**
   * Multiplies two fractions.
   * @param {BigIntFraction} other
   * @returns {BigIntFraction}
   */
  multiply(other) {
    const num = this.num * other.num;
    const den = this.den * other.den;
    return new BigIntFraction(num, den);
  }

  /**
   * Divides by another fraction.
   * @param {BigIntFraction} other
   * @returns {BigIntFraction}
   */
  divide(other) {
    const num = this.num * other.den;
    const den = this.den * other.num;
    return new BigIntFraction(num, den);
  }

  /**
   * Returns absolute value.
   * @returns {BigIntFraction}
   */
  abs() {
    return new BigIntFraction(this.num < 0n ? -this.num : this.num, this.den);
  }

  /**
   * Returns negated fraction.
   * @returns {BigIntFraction}
   */
  negate() {
    return new BigIntFraction(-this.num, this.den);
  }

  /**
   * Compares with another fraction.
   * @param {BigIntFraction} other
   * @returns {number} -1 if this < other, 1 if this > other, 0 if equal
   */
  compare(other) {
    const diff = this.num * other.den - other.num * this.den;
    if (diff < 0n) return -1;
    if (diff > 0n) return 1;
    return 0;
  }

  /**
   * Returns true if equal.
   * @param {BigIntFraction} other
   * @returns {boolean}
   */
  equals(other) {
    return this.compare(other) === 0;
  }

  /**
   * Converts to approximate JavaScript float number.
   * @returns {number}
   */
  toNumber() {
    return Number(this.num) / Number(this.den);
  }

  /**
   * Formats as string: "numerator/denominator" or "integer".
   * @returns {string}
   */
  toString() {
    if (this.den === 1n) return this.num.toString();
    return `${this.num}/${this.den}`;
  }
}

export default {
  BigIntFraction
};
