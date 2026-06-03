/**
 * @module decision-tree-agent
 *
 * A rule-based decision tree agent. Rules have conditions evaluated against
 * a context object; the highest-priority matching rule's action is executed.
 * Supports single-match (evaluate) and multi-match (evaluateAll) modes.
 */

// ---------------------------------------------------------------------------
// Rule
// ---------------------------------------------------------------------------

/**
 * Represents a single condition-action rule.
 *
 * @example
 * const rule = new Rule({
 *   name: 'high-temp',
 *   condition: (ctx) => ctx.temperature > 100,
 *   action: async (ctx) => ({ ...ctx, alert: 'overheating' }),
 *   priority: 10,
 *   description: 'Fires when temperature exceeds 100°',
 * });
 */
export class Rule {
  /**
   * @param {object} options
   * @param {string}   options.name        - Unique identifier for this rule.
   * @param {Function} options.condition   - `(ctx) => boolean | truthy` — evaluated synchronously.
   * @param {Function} options.action      - `async (ctx) => result` — executed when rule matches.
   * @param {number}  [options.priority=0] - Higher values are evaluated first.
   * @param {string}  [options.description=''] - Human-readable description of the rule.
   */
  constructor({ name, condition, action, priority = 0, description = '' }) {
    if (typeof name !== 'string' || !name.trim()) {
      throw new TypeError('Rule: "name" must be a non-empty string');
    }
    if (typeof condition !== 'function') {
      throw new TypeError(`Rule "${name}": "condition" must be a function`);
    }
    if (typeof action !== 'function') {
      throw new TypeError(`Rule "${name}": "action" must be a function`);
    }

    /** @type {string} */
    this.name = name;
    /** @type {Function} */
    this.condition = condition;
    /** @type {Function} */
    this.action = action;
    /** @type {number} */
    this.priority = typeof priority === 'number' ? priority : 0;
    /** @type {string} */
    this.description = description || '';
  }
}

// ---------------------------------------------------------------------------
// DecisionTreeAgent
// ---------------------------------------------------------------------------

/**
 * A rule-based decision tree agent that evaluates conditions against a context
 * object and executes matching actions.
 *
 * @example
 * const agent = new DecisionTreeAgent({
 *   onMatch: ({ rule, result }) => console.log(`Matched: ${rule}`),
 *   onNoMatch: (ctx) => console.warn('No rule matched', ctx),
 * });
 * agent.addRule(new Rule({ name: 'greet', condition: (c) => c.greet, action: async (c) => 'hello', priority: 1 }));
 * const { matched, rule, result } = await agent.evaluate({ greet: true });
 */
export class DecisionTreeAgent {
  /**
   * @param {object}   [options={}]
   * @param {Function} [options.onMatch]   - Called after a rule's action completes. Receives `{ rule, result, ctx }`.
   * @param {Function} [options.onNoMatch] - Called when no rule matches. Receives the context object.
   */
  constructor({ onMatch, onNoMatch } = {}) {
    /** @type {Rule[]} */
    this._rules = [];
    /** @type {Function|undefined} */
    this._onMatch = typeof onMatch === 'function' ? onMatch : undefined;
    /** @type {Function|undefined} */
    this._onNoMatch = typeof onNoMatch === 'function' ? onNoMatch : undefined;
  }

  // -------------------------------------------------------------------------
  // Rule management
  // -------------------------------------------------------------------------

  /**
   * Register a single rule. Accepts a {@link Rule} instance or a plain object
   * with the same shape (it will be coerced into a Rule).
   *
   * @param {Rule|object} rule
   * @returns {DecisionTreeAgent} this (for chaining)
   */
  addRule(rule) {
    if (!(rule instanceof Rule)) {
      rule = new Rule(rule);
    }
    const duplicate = this._rules.find((r) => r.name === rule.name);
    if (duplicate) {
      throw new Error(`DecisionTreeAgent: a rule named "${rule.name}" already exists`);
    }
    this._rules.push(rule);
    return this;
  }

  /**
   * Register multiple rules at once.
   *
   * @param {Array<Rule|object>} rules
   * @returns {DecisionTreeAgent} this (for chaining)
   */
  addRules(rules) {
    if (!Array.isArray(rules)) {
      throw new TypeError('addRules: argument must be an array');
    }
    for (const rule of rules) {
      this.addRule(rule);
    }
    return this;
  }

  /**
   * Remove a rule by name. No-op if the rule does not exist.
   *
   * @param {string} name
   * @returns {boolean} `true` if a rule was removed, `false` otherwise.
   */
  removeRule(name) {
    const before = this._rules.length;
    this._rules = this._rules.filter((r) => r.name !== name);
    return this._rules.length < before;
  }

  /**
   * Return all registered rules sorted by priority descending.
   *
   * @returns {Rule[]}
   */
  getRules() {
    return [...this._rules].sort(_byPriorityDesc);
  }

  // -------------------------------------------------------------------------
  // Evaluation
  // -------------------------------------------------------------------------

  /**
   * Sort rules by priority, find the **first** matching rule, execute its
   * action, and return a result descriptor.
   *
   * @param {object} ctx - The context object evaluated against each rule's condition.
   * @returns {Promise<{matched: boolean, rule: string|null, result: *, ctx: object}>}
   */
  async evaluate(ctx) {
    const sorted = this.getRules();

    for (const rule of sorted) {
      let matches;
      try {
        matches = rule.condition(ctx);
      } catch (err) {
        // Treat a throwing condition as non-matching; preserve rule evaluation.
        matches = false;
      }

      if (matches) {
        const result = await rule.action(ctx);
        if (this._onMatch) {
          this._onMatch({ rule: rule.name, result, ctx });
        }
        return { matched: true, rule: rule.name, result, ctx };
      }
    }

    // No rule matched.
    if (this._onNoMatch) {
      this._onNoMatch(ctx);
    }
    return { matched: false, rule: null, result: undefined, ctx };
  }

  /**
   * Run **all** matching rules in priority order (highest first). Each action
   * receives the original context; results are collected independently.
   *
   * @param {object} ctx - The context object evaluated against each rule's condition.
   * @returns {Promise<Array<{rule: string, result: *}>>} Array of results for every rule that matched.
   */
  async evaluateAll(ctx) {
    const sorted = this.getRules();
    const results = [];

    for (const rule of sorted) {
      let matches;
      try {
        matches = rule.condition(ctx);
      } catch (_) {
        matches = false;
      }

      if (matches) {
        const result = await rule.action(ctx);
        if (this._onMatch) {
          this._onMatch({ rule: rule.name, result, ctx });
        }
        results.push({ rule: rule.name, result });
      }
    }

    if (results.length === 0 && this._onNoMatch) {
      this._onNoMatch(ctx);
    }

    return results;
  }
}

// ---------------------------------------------------------------------------
// buildRule factory helper
// ---------------------------------------------------------------------------

/**
 * Convenience factory for creating a {@link Rule} without the object-literal
 * constructor syntax.
 *
 * @param {string}   name        - Unique rule name.
 * @param {Function} conditionFn - `(ctx) => boolean | truthy`
 * @param {Function} actionFn    - `async (ctx) => result`
 * @param {number}  [priority=0] - Evaluation priority (higher = sooner).
 * @returns {Rule}
 *
 * @example
 * const rule = buildRule('isAdmin', (ctx) => ctx.role === 'admin', async (ctx) => 'admin-action', 5);
 */
export function buildRule(name, conditionFn, actionFn, priority = 0) {
  return new Rule({ name, condition: conditionFn, action: actionFn, priority });
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Comparator: sort rules by priority, highest first.
 * @param {Rule} a
 * @param {Rule} b
 * @returns {number}
 */
function _byPriorityDesc(a, b) {
  return b.priority - a.priority;
}
