/**
 * observability/health-check
 *
 * Health, readiness, and liveness endpoint builder. Runs registered async checks
 * concurrently with timeouts, returning an aggregated status and server handlers.
 */

export class HealthChecker {
  constructor() {
    this.checks = new Map(); // name -> { fn, timeout }
  }

  /**
   * Register a health check dependency
   * @param {string} name - Name of the check (e.g. 'database')
   * @param {() => Promise<boolean|object>|boolean|object} checkFn - Function that runs the check.
   *   Should return true, or an object, or throw/reject on failure.
   * @param {number} [timeoutMs=3000] - Timeout for the check in milliseconds
   */
  register(name, checkFn, timeoutMs = 3000) {
    if (typeof name !== 'string' || name.trim() === '') {
      throw new TypeError('Check name must be a non-empty string');
    }
    if (typeof checkFn !== 'function') {
      throw new TypeError('checkFn must be a function');
    }
    this.checks.set(name, { fn: checkFn, timeout: timeoutMs });
  }

  /**
   * Run all registered checks and aggregate the status
   * @returns {Promise<{ status: 'UP'|'DOWN', time: string, details: Record<string, any> }>}
   */
  async check() {
    const details = {};
    let overallUp = true;
    const startTime = Date.now();

    const checkPromises = Array.from(this.checks.entries()).map(async ([name, checkObj]) => {
      const checkStart = Date.now();
      let status = 'UP';
      let error = null;
      let checkData = null;

      try {
        // Execute check with timeout wrapper
        const runCheck = async () => checkObj.fn();
        let timer;
        const timeoutPromise = new Promise((_, reject) => {
          timer = setTimeout(() => reject(new Error(`Timeout after ${checkObj.timeout}ms`)), checkObj.timeout);
        });

        const res = await Promise.race([runCheck(), timeoutPromise]);
        clearTimeout(timer);

        if (res === false) {
          status = 'DOWN';
          overallUp = false;
        } else if (typeof res === 'object' && res !== null) {
          if (res.status === 'DOWN') {
            status = 'DOWN';
            overallUp = false;
          }
          checkData = res;
        }
      } catch (err) {
        status = 'DOWN';
        overallUp = false;
        error = err.message || err.toString();
      }

      const durationMs = Date.now() - checkStart;
      details[name] = {
        status,
        durationMs,
        ...(checkData ? { data: checkData } : {}),
        ...(error ? { error } : {})
      };
    });

    await Promise.all(checkPromises);

    return {
      status: overallUp ? 'UP' : 'DOWN',
      time: new Date().toISOString(),
      durationMs: Date.now() - startTime,
      details
    };
  }

  /**
   * Get a standard HTTP request/response handler compatible with Node's http.createServer
   * @returns {(req: any, res: any) => void}
   */
  getHandler() {
    return async (req, res) => {
      try {
        const result = await this.check();
        const statusCode = result.status === 'UP' ? 200 : 503;
        res.writeHead(statusCode, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'DOWN', error: err.message || err.toString() }));
      }
    };
  }
}
