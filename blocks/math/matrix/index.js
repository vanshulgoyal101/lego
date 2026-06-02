/**
 * A lightweight helper class for matrix mathematics and operations.
 * Supports basic M x N dimension layout calculations.
 */
export class Matrix {
  /**
   * @param {Array<Array<number>>} data - 2D array representing rows and columns.
   */
  constructor(data) {
    if (!Array.isArray(data) || data.some(row => !Array.isArray(row))) {
      throw new Error('Matrix data must be a 2D array');
    }
    this.data = data;
    this.rows = data.length;
    this.cols = data[0] ? data[0].length : 0;
  }

  /**
   * Helper to initialize a zero matrix of given dimensions.
   * @param {number} rows
   * @param {number} cols
   * @returns {Matrix}
   */
  static zeros(rows, cols) {
    const data = Array.from({ length: rows }, () => Array(cols).fill(0));
    return new Matrix(data);
  }

  /**
   * Helper to initialize an identity matrix of size N.
   * @param {number} n
   * @returns {Matrix}
   */
  static identity(n) {
    const m = Matrix.zeros(n, n);
    for (let i = 0; i < n; i++) {
      m.data[i][i] = 1;
    }
    return m;
  }

  /**
   * Add this matrix to another of matching dimensions.
   * @param {Matrix} m
   * @returns {Matrix}
   */
  add(m) {
    if (this.rows !== m.rows || this.cols !== m.cols) {
      throw new Error('Matrix dimensions must match for addition');
    }
    const result = this.data.map((row, i) =>
      row.map((val, j) => val + m.data[i][j])
    );
    return new Matrix(result);
  }

  /**
   * Multiply this matrix by a scalar.
   * @param {number} scalar
   * @returns {Matrix}
   */
  scale(scalar) {
    const result = this.data.map(row => row.map(val => val * scalar));
    return new Matrix(result);
  }

  /**
   * Transpose of the matrix.
   * @returns {Matrix}
   */
  transpose() {
    const result = Array.from({ length: this.cols }, () => Array(this.rows).fill(0));
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        result[j][i] = this.data[i][j];
      }
    }
    return new Matrix(result);
  }

  /**
   * Multiply this matrix with another.
   * @param {Matrix} m
   * @returns {Matrix}
   */
  multiply(m) {
    if (this.cols !== m.rows) {
      throw new Error('Matrix multiplication dimensions mismatched: columns of A must match rows of B');
    }

    const result = Array.from({ length: this.rows }, () => Array(m.cols).fill(0));

    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < m.cols; j++) {
        let sum = 0;
        for (let k = 0; k < this.cols; k++) {
          sum += this.data[i][k] * m.data[k][j];
        }
        result[i][j] = sum;
      }
    }
    return new Matrix(result);
  }

  /**
   * Calculate matrix determinant (only supported for square matrices of size <= 3).
   * @returns {number}
   */
  determinant() {
    if (this.rows !== this.cols) {
      throw new Error('Determinant calculation requires a square matrix');
    }

    if (this.rows === 1) {
      return this.data[0][0];
    }

    if (this.rows === 2) {
      return this.data[0][0] * this.data[1][1] - this.data[0][1] * this.data[1][0];
    }

    if (this.rows === 3) {
      const [[a, b, c], [d, e, f], [g, h, i]] = this.data;
      return a * (e * i - f * h) - b * (d * i - f * g) + c * (d * h - e * g);
    }

    throw new Error('Determinants for dimensions larger than 3x3 not supported');
  }

  /**
   * Inverse of a 2x2 matrix.
   * @returns {Matrix}
   */
  inverse2x2() {
    if (this.rows !== 2 || this.cols !== 2) {
      throw new Error('Inversion only supported for 2x2 matrices');
    }

    const det = this.determinant();
    if (det === 0) {
      throw new Error('Matrix is singular and cannot be inverted');
    }

    const [[a, b], [c, d]] = this.data;
    const invData = [
      [d / det, -b / det],
      [-c / det, a / det]
    ];
    return new Matrix(invData);
  }
}
