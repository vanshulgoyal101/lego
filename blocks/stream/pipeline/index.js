/**
 * Stream Pipeline Orchestrator
 * Chains async generators, maps, filters, and custom transforms with error handling and metrics.
 */

export class Pipeline {
  /**
   * Create a new Pipeline
   * @param {any[]|Iterable|AsyncIterable|(() => AsyncIterable)} source
   */
  constructor(source) {
    this.source = source;
    this.steps = [];
    this.errorHandler = null;
    this.errorCount = 0;
  }

  /**
   * Add a custom transform step (generator function or function returning iterable)
   * @param {Function} transformFn
   * @returns {Pipeline}
   */
  transform(transformFn) {
    this.steps.push((iterable, pipeline) => transformFn(iterable, pipeline));
    return this;
  }

  /**
   * Add a mapping transform step
   * @param {Function} mapFn
   * @returns {Pipeline}
   */
  map(mapFn) {
    this.steps.push(async function*(iterable, pipeline) {
      for await (const item of iterable) {
        try {
          yield await mapFn(item);
        } catch (err) {
          if (pipeline.errorHandler) {
            pipeline.errorCount++;
            const recovered = await pipeline.errorHandler(err, item);
            if (recovered !== undefined) {
              yield recovered;
            }
          } else {
            throw err;
          }
        }
      }
    });
    return this;
  }

  /**
   * Add a filtering transform step
   * @param {Function} filterFn
   * @returns {Pipeline}
   */
  filter(filterFn) {
    this.steps.push(async function*(iterable, pipeline) {
      for await (const item of iterable) {
        try {
          if (await filterFn(item)) {
            yield item;
          }
        } catch (err) {
          if (pipeline.errorHandler) {
            pipeline.errorCount++;
            const recovered = await pipeline.errorHandler(err, item);
            if (recovered !== undefined) {
              yield recovered;
            }
          } else {
            throw err;
          }
        }
      }
    });
    return this;
  }

  /**
   * Add a side-effect tap step
   * @param {Function} tapFn
   * @returns {Pipeline}
   */
  tap(tapFn) {
    this.steps.push(async function*(iterable, pipeline) {
      for await (const item of iterable) {
        try {
          await tapFn(item);
          yield item;
        } catch (err) {
          if (pipeline.errorHandler) {
            pipeline.errorCount++;
            const recovered = await pipeline.errorHandler(err, item);
            if (recovered !== undefined) {
              yield recovered;
            }
          } else {
            throw err;
          }
        }
      }
    });
    return this;
  }

  /**
   * Register a global error handler for the pipeline
   * @param {Function} handler (error, item) => recoveredItem | undefined (if dropped)
   * @returns {Pipeline}
   */
  catch(handler) {
    this.errorHandler = handler;
    return this;
  }

  /**
   * Helper to convert various source formats to an AsyncIterable
   * @private
   */
  _toAsyncIterable(source) {
    const resolved = typeof source === 'function' ? source() : source;

    if (resolved && typeof resolved[Symbol.asyncIterator] === 'function') {
      return resolved;
    }

    if (resolved && typeof resolved[Symbol.iterator] === 'function') {
      return (async function*() {
        for (const item of resolved) {
          yield item;
        }
      })();
    }

    if (Array.isArray(resolved)) {
      return (async function*() {
        for (const item of resolved) {
          yield item;
        }
      })();
    }

    throw new Error('Invalid source: Must be an Array, Iterable, AsyncIterable, or a function returning one.');
  }

  /**
   * Run the pipeline to completion, optionally piping to a sink function
   * @param {Function} [sinkFn] Optional function to consume the pipeline output
   * @returns {Promise<{success: boolean, count: number, errorCount: number, durationMs: number, results?: any[]}>}
   */
  async run(sinkFn = null) {
    const startTime = Date.now();
    this.errorCount = 0;
    let successCount = 0;
    let current = this._toAsyncIterable(this.source);

    for (const step of this.steps) {
      current = step(current, this);
    }

    const results = [];
    
    try {
      for await (const item of current) {
        try {
          if (sinkFn) {
            await sinkFn(item);
          } else {
            results.push(item);
          }
          successCount++;
        } catch (err) {
          this.errorCount++;
          if (this.errorHandler) {
            const recovered = await this.errorHandler(err, item);
            if (recovered !== undefined) {
              if (sinkFn) {
                await sinkFn(recovered);
              } else {
                results.push(recovered);
              }
              successCount++;
            }
          } else {
            throw err;
          }
        }
      }
    } catch (err) {
      if (!this.errorHandler) {
        throw err;
      }
      this.errorCount++;
      await this.errorHandler(err, null);
    }

    return {
      success: this.errorCount === 0,
      count: successCount,
      errorCount: this.errorCount,
      durationMs: Date.now() - startTime,
      results: sinkFn ? undefined : results
    };
  }
}
