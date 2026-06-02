/**
 * A lightweight, fluent object schema validation engine (Zod-like syntax).
 * Supports string, number, boolean, array, and object structure validations.
 */

class BaseValidator {
  constructor(type) {
    this.type = type;
    this.checks = [];
    this.errorMessage = null;
  }

  /**
   * Internal validator runner helper.
   * @private
   */
  _validate(value) {
    // Check type matching
    if (this.type === 'array') {
      if (!Array.isArray(value)) {
        return { success: false, error: this.errorMessage || `Expected array, got ${typeof value}` };
      }
    } else if (typeof value !== this.type) {
      return { success: false, error: this.errorMessage || `Expected ${this.type}, got ${typeof value}` };
    }

    // Run custom checks
    for (const check of this.checks) {
      const err = check(value);
      if (err) {
        return { success: false, error: err };
      }
    }

    return { success: true, data: value };
  }

  /**
   * Set a custom error message for verification failures.
   */
  message(msg) {
    this.errorMessage = msg;
    return this;
  }
}

class StringValidator extends BaseValidator {
  constructor() {
    super('string');
  }

  min(length) {
    this.checks.push(val => val.length < length ? `String length must be at least ${length}` : null);
    return this;
  }

  max(length) {
    this.checks.push(val => val.length > length ? `String length must be at most ${length}` : null);
    return this;
  }

  email() {
    this.checks.push(val => !/\S+@\S+\.\S+/.test(val) ? 'Invalid email address format' : null);
    return this;
  }
}

class NumberValidator extends BaseValidator {
  constructor() {
    super('number');
  }

  min(minVal) {
    this.checks.push(val => val < minVal ? `Number must be >= ${minVal}` : null);
    return this;
  }

  max(maxVal) {
    this.checks.push(val => val > maxVal ? `Number must be <= ${maxVal}` : null);
    return this;
  }
}

class BooleanValidator extends BaseValidator {
  constructor() {
    super('boolean');
  }
}

class ArrayValidator extends BaseValidator {
  constructor(elementSchema = null) {
    super('array');
    this.elementSchema = elementSchema;
  }

  min(length) {
    this.checks.push(val => val.length < length ? `Array length must be >= ${length}` : null);
    return this;
  }

  _validate(value) {
    const baseResult = super._validate(value);
    if (!baseResult.success) return baseResult;

    if (this.elementSchema) {
      for (let i = 0; i < value.length; i++) {
        const itemResult = this.elementSchema._validate(value[i]);
        if (!itemResult.success) {
          return { success: false, error: `Array index [${i}]: ${itemResult.error}` };
        }
      }
    }
    return { success: true, data: value };
  }
}

class ObjectValidator {
  constructor(shape) {
    this.shape = shape;
  }

  _validate(value) {
    if (value === null || typeof value !== 'object' || Array.isArray(value)) {
      return { success: false, error: 'Expected object' };
    }

    const data = {};
    for (const [key, validator] of Object.entries(this.shape)) {
      const propValue = value[key];
      const result = validator._validate(propValue);
      if (!result.success) {
        return { success: false, error: `Property '${key}': ${result.error}` };
      }
      data[key] = result.data;
    }

    return { success: true, data };
  }

  /**
   * Validate input data. Throws on error if strict is wanted, or returns result object.
   */
  parse(data) {
    const result = this._validate(data);
    if (!result.success) {
      throw new Error(`Schema Validation Error: ${result.error}`);
    }
    return result.data;
  }

  /**
   * Safe validate returning success state and error strings without throwing.
   */
  safeParse(data) {
    return this._validate(data);
  }
}

// Fluent schema builder interface exports
export const schema = {
  string: () => new StringValidator(),
  number: () => new NumberValidator(),
  boolean: () => new BooleanValidator(),
  array: (elementSchema) => new ArrayValidator(elementSchema),
  object: (shape) => new ObjectValidator(shape)
};
