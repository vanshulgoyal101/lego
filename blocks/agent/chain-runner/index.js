/**
 * @module chain-runner
 *
 * Sequential / branching chain executor for AI agents.
 *
 * Steps are async functions that receive a shared context object and return an
 * updated context.  The runner threads the return value of each step into the
 * next one, making it easy to build linear pipelines or conditional branches
 * without any external framework.
 *
 * Features
 * --------
 * - Ordered step registration via `addStep()`
 * - Per-step retry with configurable attempt count
 * - `skipOnError` flag to continue the chain after exhausted retries
 * - `condition(ctx)` predicate to conditionally skip a step at runtime
 * - `onStep` callback fired after every step (success, skip, or final error)
 * - `onError` callback fired after every failed attempt
 * - Full execution trace returned alongside the final context
 */

/**
 * @typedef {Object} StepOptions
 * @property {number}   [retries=0]       Number of *extra* attempts after the
 *                                        first failure (0 = try once total).
 * @property {boolean}  [skipOnError=false] When true the chain continues even
 *                                        if all retry attempts fail.
 * @property {Function|null} [condition=null] Predicate `(ctx) => boolean`.
 *                                        When provided and returns falsy the
 *                                        step is skipped without calling `fn`.
 */

/**
 * @typedef {Object} StepRecord
 * @property {string}  name      Step name.
 * @property {string}  status    One of `'success'`, `'skipped'`, `'error'`.
 * @property {number}  duration  Wall-clock milliseconds the step took.
 * @property {*}       ctx       Context value *after* the step completed.
 * @property {Error|null} error  Set when status is `'error'`.
 * @property {number}  attempts  Total invocation attempts (1 on first success).
 */

/**
 * @typedef {Object} RunResult
 * @property {Object}      ctx   Final context after all steps have run.
 * @property {StepRecord[]} trace Ordered array of per-step execution records.
 */

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Sleep for `ms` milliseconds.  Used between retry attempts.
 * @param {number} ms
 * @returns {Promise<void>}
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Execute a single async step function with retry logic.
 *
 * @param {Function} fn       The step function `async (ctx) => ctx`.
 * @param {*}        ctx      Current context passed to the step.
 * @param {number}   retries  Extra attempts allowed after first failure.
 * @param {Function} onError  Called as `onError({ name, error, attempt })`.
 * @param {string}   name     Step name (forwarded to `onError`).
 * @returns {Promise<{ result: *, attempts: number }>}
 */
async function executeWithRetry(fn, ctx, retries, onError, name) {
  let lastError;
  const maxAttempts = retries + 1;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const result = await fn(ctx);
      return { result, attempts: attempt };
    } catch (err) {
      lastError = err;
      if (typeof onError === 'function') {
        await onError({ name, error: err, attempt });
      }
      // Brief back-off before retry (doubles each time, starts at 50 ms).
      if (attempt < maxAttempts) {
        await sleep(50 * attempt);
      }
    }
  }

  throw lastError;
}

// ---------------------------------------------------------------------------
// ChainRunner
// ---------------------------------------------------------------------------

/**
 * Sequential / branching chain executor.
 *
 * @example
 * const runner = new ChainRunner({
 *   onStep: ({ name, status, duration }) =>
 *     console.log(`[${status}] ${name} (${duration}ms)`),
 *   onError: ({ name, error, attempt }) =>
 *     console.error(`${name} attempt ${attempt} failed:`, error.message),
 * });
 *
 * runner.addStep('fetch', async (ctx) => ({ ...ctx, data: await fetchData() }));
 * runner.addStep('transform', async (ctx) => ({ ...ctx, data: transform(ctx.data) }));
 *
 * const { ctx, trace } = await runner.run({ userId: 42 });
 */
export class ChainRunner {
  /**
   * @param {Object}   [opts={}]
   * @param {Function} [opts.onStep]  Called after each step with a
   *                                  {@link StepRecord}-shaped object.
   * @param {Function} [opts.onError] Called on each failed attempt with
   *                                  `{ name, error, attempt }`.
   */
  constructor({ onStep, onError } = {}) {
    /** @type {Array<{ name: string, fn: Function, opts: StepOptions }>} */
    this._steps = [];
    this._onStep = typeof onStep === 'function' ? onStep : null;
    this._onError = typeof onError === 'function' ? onError : null;
  }

  /**
   * Register a step at the end of the chain.
   *
   * @param {string}      name  Unique human-readable step identifier.
   * @param {Function}    fn    Async step function: `async (ctx) => newCtx`.
   *                            May mutate and return the same object or return
   *                            a brand-new context — both patterns work.
   * @param {StepOptions} [opts={}] Per-step configuration.
   * @returns {this} The runner instance (fluent API).
   */
  addStep(name, fn, opts = {}) {
    if (typeof name !== 'string' || name.trim() === '') {
      throw new TypeError('Step name must be a non-empty string.');
    }
    if (typeof fn !== 'function') {
      throw new TypeError(`Step "${name}": fn must be a function.`);
    }

    const { retries = 0, skipOnError = false, condition = null } = opts;

    this._steps.push({
      name,
      fn,
      opts: {
        retries: Math.max(0, Math.floor(retries)),
        skipOnError: Boolean(skipOnError),
        condition: typeof condition === 'function' ? condition : null,
      },
    });

    return this;
  }

  /**
   * Return the ordered list of registered step names.
   *
   * @returns {string[]}
   */
  getSteps() {
    return this._steps.map((s) => s.name);
  }

  /**
   * Execute the chain sequentially, starting from `initialContext`.
   *
   * @param {Object} [initialContext={}] Seed context passed to the first step.
   * @returns {Promise<RunResult>}
   * @throws {Error} Re-throws the step error when `skipOnError` is false and
   *                 all retry attempts are exhausted.
   */
  async run(initialContext = {}) {
    let ctx = initialContext;
    /** @type {StepRecord[]} */
    const trace = [];

    for (const { name, fn, opts } of this._steps) {
      const start = Date.now();

      // ── Condition guard ──────────────────────────────────────────────────
      if (opts.condition !== null) {
        let shouldRun;
        try {
          shouldRun = await opts.condition(ctx);
        } catch {
          shouldRun = false;
        }

        if (!shouldRun) {
          const record = {
            name,
            status: 'skipped',
            duration: Date.now() - start,
            ctx,
            error: null,
            attempts: 0,
          };
          trace.push(record);
          if (this._onStep) await this._onStep(record);
          continue;
        }
      }

      // ── Execution with retry ─────────────────────────────────────────────
      try {
        const { result, attempts } = await executeWithRetry(
          fn,
          ctx,
          opts.retries,
          this._onError,
          name,
        );

        // Accept undefined/null return (step mutated ctx in place).
        if (result !== undefined && result !== null) {
          ctx = result;
        }

        const record = {
          name,
          status: 'success',
          duration: Date.now() - start,
          ctx,
          error: null,
          attempts,
        };
        trace.push(record);
        if (this._onStep) await this._onStep(record);
      } catch (err) {
        const record = {
          name,
          status: 'error',
          duration: Date.now() - start,
          ctx,
          error: err,
          attempts: opts.retries + 1,
        };
        trace.push(record);
        if (this._onStep) await this._onStep(record);

        if (!opts.skipOnError) {
          throw err;
        }
        // skipOnError: continue with current (unmodified) ctx.
      }
    }

    return { ctx, trace };
  }
}
