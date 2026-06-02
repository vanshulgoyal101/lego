/**
 * Polynomial Arithmetic
 *
 * A class representing a polynomial whose coefficients are stored in an array
 * indexed by degree: coefficients[k] is the coefficient of x^k.
 *
 * @example
 * // 3 + 2x - x^2
 * const p = new Polynomial([3, 2, -1]);
 */
export class Polynomial {
  /**
   * @param {number[]} coefficients - Array of coefficients (index = degree).
   *   coefficients[0] is the constant term, coefficients[1] is for x, etc.
   */
  constructor(coefficients) {
    if (!Array.isArray(coefficients) || coefficients.length === 0) {
      throw new TypeError('Polynomial: coefficients must be a non-empty array');
    }
    // Trim trailing zeros to keep canonical form
    this.coefficients = [...coefficients];
    this._trim();
  }

  /** Remove trailing zero coefficients (highest-degree terms). */
  _trim() {
    while (this.coefficients.length > 1 && this.coefficients[this.coefficients.length - 1] === 0) {
      this.coefficients.pop();
    }
  }

  /** Degree of the polynomial (highest non-zero power). */
  get degree() {
    return this.coefficients.length - 1;
  }

  // ─── Arithmetic ────────────────────────────────────────────────────────────

  /**
   * Add two polynomials.
   * @param {Polynomial} p
   * @returns {Polynomial}
   */
  add(p) {
    const len = Math.max(this.coefficients.length, p.coefficients.length);
    const result = new Array(len).fill(0);
    for (let i = 0; i < len; i++) {
      result[i] = (this.coefficients[i] ?? 0) + (p.coefficients[i] ?? 0);
    }
    return new Polynomial(result);
  }

  /**
   * Subtract another polynomial.
   * @param {Polynomial} p
   * @returns {Polynomial}
   */
  sub(p) {
    const len = Math.max(this.coefficients.length, p.coefficients.length);
    const result = new Array(len).fill(0);
    for (let i = 0; i < len; i++) {
      result[i] = (this.coefficients[i] ?? 0) - (p.coefficients[i] ?? 0);
    }
    return new Polynomial(result);
  }

  /**
   * Multiply two polynomials via naive O(n²) convolution.
   * @param {Polynomial} p
   * @returns {Polynomial}
   */
  mul(p) {
    const result = new Array(this.degree + p.degree + 1).fill(0);
    for (let i = 0; i <= this.degree; i++) {
      for (let j = 0; j <= p.degree; j++) {
        result[i + j] += this.coefficients[i] * p.coefficients[j];
      }
    }
    return new Polynomial(result);
  }

  /**
   * Evaluate the polynomial at x using Horner's method (O(n)).
   * @param {number} x
   * @returns {number}
   * @example new Polynomial([1, 0, 1]).evaluate(3); // 1 + 9 = 10
   */
  evaluate(x) {
    let result = 0;
    for (let i = this.degree; i >= 0; i--) {
      result = result * x + this.coefficients[i];
    }
    return result;
  }

  /**
   * Return the formal derivative as a new Polynomial.
   * The derivative of a_n * x^n is n * a_n * x^(n-1).
   * @returns {Polynomial}
   */
  derivative() {
    if (this.degree === 0) return new Polynomial([0]);
    const result = [];
    for (let i = 1; i <= this.degree; i++) {
      result.push(i * this.coefficients[i]);
    }
    return new Polynomial(result);
  }

  /**
   * Convert to a human-readable string like "3 + 2x - x^2".
   * @returns {string}
   */
  toString() {
    if (this.coefficients.every(c => c === 0)) return '0';
    const terms = [];
    for (let i = this.degree; i >= 0; i--) {
      const c = this.coefficients[i];
      if (c === 0) continue;
      let term;
      if (i === 0) {
        term = String(c);
      } else if (i === 1) {
        term = c === 1 ? 'x' : c === -1 ? '-x' : `${c}x`;
      } else {
        term = c === 1 ? `x^${i}` : c === -1 ? `-x^${i}` : `${c}x^${i}`;
      }
      terms.push(term);
    }
    // Join with + or - signs between terms
    let str = terms[0];
    for (let i = 1; i < terms.length; i++) {
      if (terms[i].startsWith('-')) {
        str += ` - ${terms[i].slice(1)}`;
      } else {
        str += ` + ${terms[i]}`;
      }
    }
    return str;
  }
}
