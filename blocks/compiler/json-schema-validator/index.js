/**
 * Draft-07 JSON Schema validation compiler.
 * Recursively validates types, properties, requirements, range boundaries,
 * array elements, regex patterns, enums, and logical schema aggregations.
 */

export function validateSchema(data, schema) {
  const errors = [];

  function check(value, currentSchema, path = '') {
    if (typeof currentSchema !== 'object' || currentSchema === null) return;

    // 1. Validate Type
    if (currentSchema.type !== undefined) {
      const type = currentSchema.type;
      const actualType = typeof value;
      let valid = true;

      if (type === 'null') {
        valid = value === null;
      } else if (type === 'integer') {
        valid = Number.isInteger(value);
      } else if (type === 'number') {
        valid = typeof value === 'number' && !isNaN(value);
      } else if (type === 'array') {
        valid = Array.isArray(value);
      } else if (type === 'object') {
        valid = actualType === 'object' && value !== null && !Array.isArray(value);
      } else if (type === 'boolean') {
        valid = actualType === 'boolean';
      } else if (type === 'string') {
        valid = actualType === 'string';
      }

      if (!valid) {
        errors.push({ path, message: `Expected type "${type}", got "${value === null ? 'null' : actualType}"` });
        return; // Don't run sub-validators if type check failed
      }
    }

    // 2. Validate Enum
    if (Array.isArray(currentSchema.enum)) {
      const match = currentSchema.enum.some(val => JSON.stringify(val) === JSON.stringify(value));
      if (!match) {
        errors.push({ path, message: `Value must be one of allowed enums: ${JSON.stringify(currentSchema.enum)}` });
      }
    }

    // 3. Number Boundaries
    if (typeof value === 'number') {
      if (currentSchema.minimum !== undefined && value < currentSchema.minimum) {
        errors.push({ path, message: `Value must be >= ${currentSchema.minimum}` });
      }
      if (currentSchema.maximum !== undefined && value > currentSchema.maximum) {
        errors.push({ path, message: `Value must be <= ${currentSchema.maximum}` });
      }
      if (currentSchema.exclusiveMinimum !== undefined && value <= currentSchema.exclusiveMinimum) {
        errors.push({ path, message: `Value must be > ${currentSchema.exclusiveMinimum}` });
      }
      if (currentSchema.exclusiveMaximum !== undefined && value >= currentSchema.exclusiveMaximum) {
        errors.push({ path, message: `Value must be < ${currentSchema.exclusiveMaximum}` });
      }
      if (currentSchema.multipleOf !== undefined && value % currentSchema.multipleOf !== 0) {
        errors.push({ path, message: `Value must be a multiple of ${currentSchema.multipleOf}` });
      }
    }

    // 4. String Boundaries
    if (typeof value === 'string') {
      if (currentSchema.minLength !== undefined && value.length < currentSchema.minLength) {
        errors.push({ path, message: `String length must be >= ${currentSchema.minLength}` });
      }
      if (currentSchema.maxLength !== undefined && value.length > currentSchema.maxLength) {
        errors.push({ path, message: `String length must be <= ${currentSchema.maxLength}` });
      }
      if (currentSchema.pattern !== undefined) {
        const regex = new RegExp(currentSchema.pattern);
        if (!regex.test(value)) {
          errors.push({ path, message: `String must match pattern: ${currentSchema.pattern}` });
        }
      }
    }

    // 5. Array Validation
    if (Array.isArray(value)) {
      if (currentSchema.minItems !== undefined && value.length < currentSchema.minItems) {
        errors.push({ path, message: `Array size must be >= ${currentSchema.minItems}` });
      }
      if (currentSchema.maxItems !== undefined && value.length > currentSchema.maxItems) {
        errors.push({ path, message: `Array size must be <= ${currentSchema.maxItems}` });
      }
      if (currentSchema.uniqueItems === true) {
        const stringified = value.map(v => JSON.stringify(v));
        const set = new Set(stringified);
        if (set.size !== value.length) {
          errors.push({ path, message: 'Array items must be unique' });
        }
      }
      if (currentSchema.items !== undefined) {
        if (Array.isArray(currentSchema.items)) {
          // Tuple validation
          for (let i = 0; i < currentSchema.items.length; i++) {
            if (i < value.length) {
              check(value[i], currentSchema.items[i], `${path}/${i}`);
            }
          }
        } else {
          // List validation
          for (let i = 0; i < value.length; i++) {
            check(value[i], currentSchema.items, `${path}/${i}`);
          }
        }
      }
    }

    // 6. Object Validation
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      // Validate required fields
      if (Array.isArray(currentSchema.required)) {
        for (const req of currentSchema.required) {
          if (value[req] === undefined) {
            errors.push({ path: path ? `${path}/${req}` : req, message: 'Property is required' });
          }
        }
      }
      // Validate properties schemas
      if (typeof currentSchema.properties === 'object' && currentSchema.properties !== null) {
        for (const prop of Object.keys(currentSchema.properties)) {
          if (value[prop] !== undefined) {
            check(value[prop], currentSchema.properties[prop], path ? `${path}/${prop}` : prop);
          }
        }
      }
    }

    // 7. Logical Combinators
    if (Array.isArray(currentSchema.allOf)) {
      for (let i = 0; i < currentSchema.allOf.length; i++) {
        check(value, currentSchema.allOf[i], `${path}/allOf/${i}`);
      }
    }

    if (Array.isArray(currentSchema.anyOf)) {
      const match = currentSchema.anyOf.some(subSchema => {
        const subErrors = validateSchema(value, subSchema).errors;
        return subErrors.length === 0;
      });
      if (!match) {
        errors.push({ path, message: 'Value must match at least one of the schemas in anyOf' });
      }
    }

    if (Array.isArray(currentSchema.oneOf)) {
      const matchedCount = currentSchema.oneOf.reduce((acc, subSchema) => {
        const subErrors = validateSchema(value, subSchema).errors;
        return acc + (subErrors.length === 0 ? 1 : 0);
      }, 0);
      if (matchedCount !== 1) {
        errors.push({ path, message: `Value must match exactly one schema in oneOf (matched ${matchedCount})` });
      }
    }

    if (currentSchema.not !== undefined) {
      const subErrors = validateSchema(value, currentSchema.not).errors;
      if (subErrors.length === 0) {
        errors.push({ path, message: 'Value must NOT match the schema configured in not' });
      }
    }
  }

  check(data, schema);

  return {
    valid: errors.length === 0,
    errors
  };
}
