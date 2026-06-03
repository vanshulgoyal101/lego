/**
 * agent/structured-output
 *
 * Utilities for parsing and validating JSON output from LLMs.
 * Handles markdown code fences, malformed JSON extraction,
 * schema validation, and retry logic.
 */

// ---------------------------------------------------------------------------
// ParseError
// ---------------------------------------------------------------------------

/**
 * Custom error thrown when JSON cannot be extracted or parsed from LLM output.
 */
export class ParseError extends Error {
  /**
   * @param {string} message - Human-readable error description.
   * @param {string} raw     - The original raw text that failed to parse.
   */
  constructor(message, raw) {
    super(message);
    this.name = 'ParseError';
    /** @type {string} The original raw text that could not be parsed. */
    this.raw = raw;
  }
}

// ---------------------------------------------------------------------------
// extractJSON
// ---------------------------------------------------------------------------

/**
 * Extract and parse a JSON value from raw LLM output text.
 *
 * Steps performed in order:
 * 1. Strip markdown code fences (```json … ``` or ``` … ```).
 * 2. Find the first `{` or `[` and the last matching `}` or `]`.
 * 3. Attempt JSON.parse on that substring.
 *
 * @param {string} text - Raw text produced by an LLM.
 * @returns {object|Array} Parsed JSON value.
 * @throws {ParseError} When no valid JSON can be found or parsed.
 *
 * @example
 * extractJSON('```json\n{"key": "value"}\n```');
 * // => { key: 'value' }
 */
export function extractJSON(text) {
  if (typeof text !== 'string') {
    throw new ParseError('Input must be a string', String(text));
  }

  // Step 1: Strip markdown code fences.
  // Matches optional "json" language tag, captures inner content.
  let stripped = text.replace(/```(?:json)?\s*([\s\S]*?)```/g, '$1').trim();

  // Fall back to original if stripping removed everything meaningful.
  if (!stripped) stripped = text.trim();

  // Step 2: Locate outermost JSON structure.
  const firstBrace   = stripped.indexOf('{');
  const firstBracket = stripped.indexOf('[');

  let start = -1;
  let expectedClose;

  if (firstBrace === -1 && firstBracket === -1) {
    throw new ParseError('No JSON object or array found in text', text);
  } else if (firstBrace === -1) {
    start = firstBracket;
    expectedClose = ']';
  } else if (firstBracket === -1) {
    start = firstBrace;
    expectedClose = '}';
  } else {
    // Whichever comes first is the outer structure.
    if (firstBrace < firstBracket) {
      start = firstBrace;
      expectedClose = '}';
    } else {
      start = firstBracket;
      expectedClose = ']';
    }
  }

  const end = stripped.lastIndexOf(expectedClose);

  if (end === -1 || end < start) {
    throw new ParseError(
      `Found opening delimiter but no matching closing '${expectedClose}'`,
      text
    );
  }

  const jsonSubstring = stripped.slice(start, end + 1);

  // Step 3: Parse.
  try {
    return JSON.parse(jsonSubstring);
  } catch (err) {
    throw new ParseError(
      `JSON parse failed: ${err.message}`,
      text
    );
  }
}

// ---------------------------------------------------------------------------
// validateSchema
// ---------------------------------------------------------------------------

/**
 * @typedef {Object} PropertySchema
 * @property {'string'|'number'|'boolean'|'object'|'array'|'null'} [type]
 * @property {*[]}    [enum]    - Value must be one of these.
 * @property {number} [minimum] - Numeric minimum (inclusive).
 * @property {number} [maximum] - Numeric maximum (inclusive).
 */

/**
 * @typedef {Object} Schema
 * @property {string[]}                     [required]   - Required property names.
 * @property {Record<string, PropertySchema>} [properties] - Per-property constraints.
 */

/**
 * @typedef {Object} ValidationResult
 * @property {boolean}  valid  - Whether the object satisfies the schema.
 * @property {string[]} errors - Human-readable list of validation errors.
 */

/**
 * Validate a parsed object against a simple JSON schema subset.
 *
 * Supported constraints:
 * - `required` — list of keys that must be present (non-undefined).
 * - `properties.<key>.type` — JS typeof check; 'array' checks Array.isArray,
 *   'null' checks strict null equality.
 * - `properties.<key>.enum` — value must be included in the array.
 * - `properties.<key>.minimum` / `maximum` — inclusive numeric bounds.
 *
 * @param {object} obj    - The parsed object to validate.
 * @param {Schema} schema - Validation rules.
 * @returns {ValidationResult}
 *
 * @example
 * validateSchema({ age: 25 }, {
 *   required: ['age'],
 *   properties: { age: { type: 'number', minimum: 0 } }
 * });
 * // => { valid: true, errors: [] }
 */
export function validateSchema(obj, schema) {
  const errors = [];

  if (!schema || typeof schema !== 'object') {
    return { valid: true, errors };
  }

  // --- Required fields ---
  if (Array.isArray(schema.required)) {
    for (const key of schema.required) {
      if (obj === null || obj === undefined || !(key in Object(obj)) || obj[key] === undefined) {
        errors.push(`Missing required field: "${key}"`);
      }
    }
  }

  // --- Property constraints ---
  if (schema.properties && typeof schema.properties === 'object') {
    for (const [key, propSchema] of Object.entries(schema.properties)) {
      const value = obj == null ? undefined : obj[key];

      // Skip undefined optional fields (already caught above if required).
      if (value === undefined) continue;

      // Type check.
      if (propSchema.type !== undefined) {
        const expectedType = propSchema.type;
        let typeOk;

        if (expectedType === 'array') {
          typeOk = Array.isArray(value);
        } else if (expectedType === 'null') {
          typeOk = value === null;
        } else {
          typeOk = typeof value === expectedType;
        }

        if (!typeOk) {
          const actualType = Array.isArray(value) ? 'array' : value === null ? 'null' : typeof value;
          errors.push(
            `Field "${key}" expected type "${expectedType}" but got "${actualType}"`
          );
        }
      }

      // Enum check.
      if (Array.isArray(propSchema.enum)) {
        if (!propSchema.enum.includes(value)) {
          errors.push(
            `Field "${key}" must be one of [${propSchema.enum.map(v => JSON.stringify(v)).join(', ')}] but got ${JSON.stringify(value)}`
          );
        }
      }

      // Numeric bounds.
      if (typeof value === 'number') {
        if (propSchema.minimum !== undefined && value < propSchema.minimum) {
          errors.push(
            `Field "${key}" must be >= ${propSchema.minimum} but got ${value}`
          );
        }
        if (propSchema.maximum !== undefined && value > propSchema.maximum) {
          errors.push(
            `Field "${key}" must be <= ${propSchema.maximum} but got ${value}`
          );
        }
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

// ---------------------------------------------------------------------------
// parseStructured
// ---------------------------------------------------------------------------

/**
 * @typedef {Object} ParseOptions
 * @property {number}                  [retries=0]  - Number of retry attempts.
 * @property {function(string[]): Promise<string>} [refetch] - Async function
 *   called with the current error list; should return new raw LLM text.
 */

/**
 * @typedef {Object} ParseResult
 * @property {object|Array} data   - The parsed and (possibly partially invalid) data.
 * @property {boolean}      valid  - Whether the data fully satisfies the schema.
 * @property {string[]}     errors - Validation error messages (empty when valid).
 */

/**
 * Full structured-output pipeline: extract JSON, validate against schema,
 * and optionally retry via a `refetch` callback.
 *
 * @param {string}       text           - Raw LLM output text.
 * @param {Schema|null}  schema         - Schema to validate against (pass null to skip).
 * @param {ParseOptions} [options={}]   - Retry and refetch configuration.
 * @returns {Promise<ParseResult>}
 * @throws {ParseError} If JSON cannot be extracted after all retries.
 *
 * @example
 * const result = await parseStructured(llmText, {
 *   required: ['name'],
 *   properties: { name: { type: 'string' } }
 * });
 * if (!result.valid) console.error(result.errors);
 */
export async function parseStructured(text, schema, options = {}) {
  const { retries = 0, refetch } = options;

  let currentText = text;
  let lastParseError = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    // On retry attempts, fetch fresh text from the caller-supplied function.
    if (attempt > 0) {
      if (typeof refetch !== 'function') break;
      const errorMessages = lastParseError
        ? [lastParseError.message]
        : [];
      currentText = await refetch(errorMessages);
    }

    let data;
    try {
      data = extractJSON(currentText);
    } catch (err) {
      lastParseError = err;
      // If we have more retries available, continue.
      if (attempt < retries) continue;
      throw err;
    }

    // JSON extraction succeeded; run schema validation.
    const { valid, errors } = schema
      ? validateSchema(data, schema)
      : { valid: true, errors: [] };

    // If invalid and we have retries left, ask for new text.
    if (!valid && attempt < retries && typeof refetch === 'function') {
      lastParseError = null;
      // Pass validation errors to refetch so the caller can include them in
      // the retry prompt.
      currentText = await refetch(errors);
      // Re-run from the top with the new text, but don't consume a retry slot
      // for schema failures — we already did that by calling refetch here.
      try {
        data = extractJSON(currentText);
      } catch (err) {
        lastParseError = err;
        continue;
      }
      const second = schema ? validateSchema(data, schema) : { valid: true, errors: [] };
      if (second.valid || attempt === retries) {
        return { data, valid: second.valid, errors: second.errors };
      }
      continue;
    }

    return { data, valid, errors };
  }

  // Should only reach here if retries exhausted on ParseError.
  if (lastParseError) throw lastParseError;
  /* c8 ignore next */
  return { data: null, valid: false, errors: ['Unknown error'] };
}
