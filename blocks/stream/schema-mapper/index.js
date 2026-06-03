/**
 * Stream Schema Mapper
 * Transforms, coerces types, injects default values, and validates streaming record structures.
 */

export class SchemaMapper {
  /**
   * @param {Object} schema The schema configuration.
   * @param {Object} schema.fields Field definitions mapping target fields to options.
   * Example:
   * {
   *   id: { type: 'number', required: true, from: 'user_id' },
   *   email: { type: 'string', required: true, validate: (v) => v.includes('@') },
   *   active: { type: 'boolean', default: true },
   *   createdAt: { type: 'date', from: 'created_at' }
   * }
   */
  constructor(schema) {
    if (!schema || typeof schema.fields !== 'object') {
      throw new Error('Invalid schema: "fields" object is required.');
    }
    this.fields = schema.fields;
  }

  /**
   * Process a single record against the schema rules.
   * @param {Object} record Raw input object.
   * @returns {{success: boolean, data?: Object, errors?: string[]}}
   */
  process(record) {
    if (!record || typeof record !== 'object') {
      return { success: false, errors: ['Record must be a non-null object'] };
    }

    const mapped = {};
    const errors = [];

    for (const [targetKey, config] of Object.entries(this.fields)) {
      const sourceKey = config.from || targetKey;
      let val = record[sourceKey];

      // Handle default values
      if (val === undefined || val === null) {
        if (config.default !== undefined) {
          val = typeof config.default === 'function' ? config.default() : config.default;
        } else if (config.required) {
          errors.push(`Field "${targetKey}" (from source "${sourceKey}") is required but missing`);
          continue;
        } else {
          mapped[targetKey] = val;
          continue;
        }
      }

      // Handle type coercion and validation
      if (config.type) {
        try {
          val = this._coerceValue(val, config.type, config.coerce !== false);
        } catch (err) {
          errors.push(`Field "${targetKey}": ${err.message}`);
          continue;
        }
      }

      // Custom validation function
      if (typeof config.validate === 'function') {
        try {
          const isValid = config.validate(val);
          if (!isValid) {
            errors.push(`Field "${targetKey}" failed custom validation`);
            continue;
          }
        } catch (err) {
          errors.push(`Field "${targetKey}" validation error: ${err.message}`);
          continue;
        }
      }

      mapped[targetKey] = val;
    }

    if (errors.length > 0) {
      return { success: false, errors };
    }

    return { success: true, data: mapped };
  }

  /**
   * Async generator transforming a stream of records.
   * @param {Iterable|AsyncIterable} iterable Stream of records.
   * @param {Object} [options] Options configuration.
   * @param {boolean} [options.dropInvalid] If true, invalid records are dropped from the output stream.
   * @param {Function} [options.onError] Callback called with (errors, originalRecord) when validation fails.
   */
  async *transform(iterable, options = {}) {
    const { dropInvalid = false, onError = null } = options;

    for await (const record of iterable) {
      const result = this.process(record);
      if (result.success) {
        yield result.data;
      } else {
        if (onError) {
          await onError(result.errors, record);
        }
        if (!dropInvalid) {
          throw new Error(`Validation failed for record: ${result.errors.join(', ')}`);
        }
      }
    }
  }

  /**
   * @private
   */
  _coerceValue(val, type, shouldCoerce) {
    if (!shouldCoerce) {
      if (type === 'date' && !(val instanceof Date)) {
        throw new Error(`Expected Date object, got ${typeof val}`);
      }
      if (type !== 'date' && typeof val !== type) {
        throw new Error(`Expected type ${type}, got ${typeof val}`);
      }
      return val;
    }

    switch (type) {
      case 'string':
        return String(val);
      case 'number': {
        const num = Number(val);
        if (Number.isNaN(num)) {
          throw new Error(`Could not coerce value "${val}" to a Number`);
        }
        return num;
      }
      case 'boolean': {
        if (typeof val === 'string') {
          const lower = val.trim().toLowerCase();
          if (lower === 'true' || lower === '1' || lower === 'yes') return true;
          if (lower === 'false' || lower === '0' || lower === 'no') return false;
        }
        return Boolean(val);
      }
      case 'date': {
        if (val instanceof Date) {
          if (Number.isNaN(val.getTime())) {
            throw new Error('Invalid Date object');
          }
          return val;
        }
        const d = new Date(val);
        if (Number.isNaN(d.getTime())) {
          throw new Error(`Could not coerce value "${val}" to a valid Date`);
        }
        return d;
      }
      default:
        return val;
    }
  }
}
