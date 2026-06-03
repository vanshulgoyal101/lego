/**
 * agent/tool-registry
 *
 * A registry for AI agent tools/functions. Supports registering callable tools
 * with JSON Schema parameter signatures, dispatching tool calls by name, and
 * validating inputs against the registered schemas.
 */

// ---------------------------------------------------------------------------
// Type mapping used for basic type checking
// ---------------------------------------------------------------------------
const TYPE_CHECKERS = {
  string:  (v) => typeof v === 'string',
  number:  (v) => typeof v === 'number' && !Number.isNaN(v),
  integer: (v) => Number.isInteger(v),
  boolean: (v) => typeof v === 'boolean',
  array:   (v) => Array.isArray(v),
  object:  (v) => v !== null && typeof v === 'object' && !Array.isArray(v),
  null:    (v) => v === null,
};

// ---------------------------------------------------------------------------
// Internal validation helper
// ---------------------------------------------------------------------------

/**
 * Validates a plain-object `args` map against a JSON-Schema-style parameters
 * object. Checks that every required field is present and that the value of
 * each present field matches the declared type.
 *
 * @param {{ type: 'object', properties?: Record<string, { type: string, description?: string }>, required?: string[] }} schema
 *   The `parameters` sub-object of a tool's schema.
 * @param {Record<string, unknown>} args
 *   The argument map to validate.
 * @throws {TypeError} When a required field is missing or a field has an
 *   incorrect type.
 */
export function validateArgs(schema, args) {
  const properties = schema.properties ?? {};
  const required   = schema.required   ?? [];

  // 1. Ensure all required fields are present (and not undefined/null)
  for (const field of required) {
    if (!(field in args) || args[field] === undefined) {
      throw new TypeError(
        `Missing required argument: "${field}"`
      );
    }
  }

  // 2. Type-check every field that is present in args
  for (const [key, value] of Object.entries(args)) {
    const propSchema = properties[key];
    if (!propSchema) {
      // Unknown properties are allowed by default (no additionalProperties check)
      continue;
    }

    const expectedType = propSchema.type;
    if (!expectedType) continue;

    const checker = TYPE_CHECKERS[expectedType];
    if (!checker) {
      // Unknown JSON Schema type — skip runtime check
      continue;
    }

    if (!checker(value)) {
      throw new TypeError(
        `Argument "${key}" must be of type "${expectedType}", ` +
        `but received ${JSON.stringify(value)} (${typeof value})`
      );
    }
  }
}

// ---------------------------------------------------------------------------
// ToolRegistry class
// ---------------------------------------------------------------------------

/**
 * A registry that manages callable tools for AI agents.
 *
 * Tools are registered with a name, a JSON-Schema-style descriptor, and an
 * implementation function. The registry can then:
 *  - List all tools in the format expected by LLM `function_calling` APIs.
 *  - Dispatch a call to a named tool after validating the supplied arguments.
 *
 * @example
 * const registry = new ToolRegistry();
 *
 * registry.register('add', {
 *   description: 'Add two numbers together.',
 *   parameters: {
 *     type: 'object',
 *     properties: {
 *       a: { type: 'number', description: 'First operand' },
 *       b: { type: 'number', description: 'Second operand' },
 *     },
 *     required: ['a', 'b'],
 *   },
 * }, ({ a, b }) => a + b);
 *
 * const result = await registry.call('add', { a: 3, b: 4 }); // 7
 */
export class ToolRegistry {
  /** @type {Map<string, { name: string, schema: object, fn: Function }>} */
  #tools = new Map();

  // -------------------------------------------------------------------------
  // Registration
  // -------------------------------------------------------------------------

  /**
   * Register a new tool.
   *
   * @param {string} name
   *   Unique name for the tool. Must be a non-empty string.
   * @param {{ description: string, parameters: { type: 'object', properties?: object, required?: string[] } }} schema
   *   JSON-Schema-style descriptor. `parameters` follows the JSON Schema
   *   object convention used by OpenAI / Anthropic function-calling APIs.
   * @param {(args: Record<string, unknown>) => unknown} fn
   *   The implementation. Receives the validated args object and may return
   *   any value (sync or async).
   * @throws {Error} When a tool with the same name is already registered.
   * @throws {TypeError} When `name`, `schema`, or `fn` are invalid.
   */
  register(name, schema, fn) {
    if (typeof name !== 'string' || name.trim() === '') {
      throw new TypeError('Tool name must be a non-empty string.');
    }
    if (!schema || typeof schema !== 'object') {
      throw new TypeError('schema must be a plain object.');
    }
    if (typeof fn !== 'function') {
      throw new TypeError('fn must be a function.');
    }
    if (this.#tools.has(name)) {
      throw new Error(`A tool named "${name}" is already registered.`);
    }

    this.#tools.set(name, { name, schema, fn });
  }

  // -------------------------------------------------------------------------
  // Lookup helpers
  // -------------------------------------------------------------------------

  /**
   * Check whether a tool with the given name exists in the registry.
   *
   * @param {string} name
   * @returns {boolean}
   */
  has(name) {
    return this.#tools.has(name);
  }

  /**
   * Retrieve a tool definition by name.
   *
   * @param {string} name
   * @returns {{ name: string, schema: object, fn: Function }}
   * @throws {Error} When no tool with that name is registered.
   */
  get(name) {
    const tool = this.#tools.get(name);
    if (!tool) {
      throw new Error(`Tool "${name}" is not registered.`);
    }
    return tool;
  }

  // -------------------------------------------------------------------------
  // LLM-ready listing
  // -------------------------------------------------------------------------

  /**
   * Return the list of all registered tools formatted for use with LLM
   * function-calling APIs (OpenAI, Anthropic, Gemini, etc.).
   *
   * @returns {Array<{ name: string, description: string, parameters: object }>}
   */
  list() {
    return Array.from(this.#tools.values()).map(({ name, schema }) => ({
      name,
      description: schema.description ?? '',
      parameters:  schema.parameters  ?? { type: 'object', properties: {} },
    }));
  }

  // -------------------------------------------------------------------------
  // Dispatch
  // -------------------------------------------------------------------------

  /**
   * Validate `args` against the tool's schema and invoke the tool function.
   *
   * @param {string} name   The registered tool name.
   * @param {Record<string, unknown>} [args={}]  Arguments to pass to the tool.
   * @returns {Promise<unknown>} The value returned by the tool function.
   * @throws {Error}      When the tool is not found.
   * @throws {TypeError}  When argument validation fails.
   */
  async call(name, args = {}) {
    const tool = this.get(name); // throws if not found

    const parametersSchema = tool.schema.parameters ?? {
      type: 'object',
      properties: {},
      required: [],
    };

    validateArgs(parametersSchema, args);

    return tool.fn(args);
  }
}
