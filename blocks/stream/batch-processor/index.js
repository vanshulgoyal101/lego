/**
 * Stream Batch Processor
 * Groups incoming streaming elements into batches based on count, bytes, or time duration.
 */

export class BatchProcessor {
  /**
   * @param {Object} options
   * @param {number} [options.maxBatchSize] Max number of items per batch
   * @param {number} [options.maxByteSize] Max total byte size per batch
   * @param {number} [options.maxTimeMs] Max wait time in ms before flushing a batch
   * @param {Function} [options.sizeFn] Function to estimate byte size of an item (default: JSON.stringify size)
   * @param {Function} [options.onBatch] Callback triggered on batch completion in push-mode
   */
  constructor(options = {}) {
    this.maxBatchSize = options.maxBatchSize || null;
    this.maxByteSize = options.maxByteSize || null;
    this.maxTimeMs = options.maxTimeMs || null;
    this.sizeFn = options.sizeFn || (item => JSON.stringify(item).length);
    this.onBatch = options.onBatch || null;

    this.buffer = [];
    this.currentByteSize = 0;
    this.timer = null;
  }

  /**
   * Push a single item into the processor (Push-mode)
   * @param {any} item
   * @returns {Promise<void>}
   */
  async push(item) {
    const itemSize = this.maxByteSize ? this.sizeFn(item) : 0;
    
    // If single item exceeds byte limit, flush existing buffer first
    if (this.maxByteSize && this.currentByteSize + itemSize > this.maxByteSize && this.buffer.length > 0) {
      await this.flush();
    }

    this.buffer.push(item);
    this.currentByteSize += itemSize;

    // Start timer if maxTimeMs is set and timer is not already active
    if (this.maxTimeMs && !this.timer) {
      this.timer = setTimeout(() => {
        this.timer = null;
        this.flush();
      }, this.maxTimeMs);
    }

    // Check bounds
    const countLimitReached = this.maxBatchSize && this.buffer.length >= this.maxBatchSize;
    const sizeLimitReached = this.maxByteSize && this.currentByteSize >= this.maxByteSize;

    if (countLimitReached || sizeLimitReached) {
      await this.flush();
    }
  }

  /**
   * Force flush the current buffer
   * @returns {Promise<any[]|null>} The flushed batch, or null if buffer is empty
   */
  async flush() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }

    if (this.buffer.length === 0) return null;

    const batch = this.buffer;
    this.buffer = [];
    this.currentByteSize = 0;

    if (this.onBatch) {
      await this.onBatch(batch);
    }
    return batch;
  }

  /**
   * Transforms an Iterable or AsyncIterable into an AsyncIterable of batches.
   * @param {Iterable|AsyncIterable} iterable
   * @returns {AsyncGenerator<any[]>}
   */
  async *transform(iterable) {
    const batches = [];
    let resolveBatch = null;
    let errorOccurred = null;

    const processor = new BatchProcessor({
      maxBatchSize: this.maxBatchSize,
      maxByteSize: this.maxByteSize,
      maxTimeMs: this.maxTimeMs,
      sizeFn: this.sizeFn,
      onBatch: (batch) => {
        batches.push(batch);
        if (resolveBatch) {
          resolveBatch();
          resolveBatch = null;
        }
      }
    });

    const iterator = iterable[Symbol.asyncIterator]
      ? iterable[Symbol.asyncIterator]()
      : iterable[Symbol.iterator]();

    // Start a promise loop that consumes the input iterator
    const consumePromise = (async () => {
      try {
        while (true) {
          const { value, done } = await iterator.next();
          if (done) break;
          await processor.push(value);
        }
        await processor.flush();
      } catch (err) {
        errorOccurred = err;
        if (resolveBatch) {
          resolveBatch();
        }
      } finally {
        // Signal completion
        batches.push(null);
        if (resolveBatch) {
          resolveBatch();
        }
      }
    })();

    try {
      while (true) {
        if (errorOccurred) throw errorOccurred;

        if (batches.length > 0) {
          const next = batches.shift();
          if (next === null) break;
          yield next;
          continue;
        }

        await new Promise((resolve) => {
          resolveBatch = resolve;
        });
      }
    } finally {
      // Clean up timer if active
      if (processor.timer) {
        clearTimeout(processor.timer);
      }
      await consumePromise;
    }
  }
}
