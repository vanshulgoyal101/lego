/**
 * An async Semaphore utility to throttle concurrent promise operations.
 * Limits the number of parallel executions of asynchronous blocks of code.
 */
export class Semaphore {
  /**
   * @param {number} maxConcurrency - Max number of concurrent lock slots.
   */
  constructor(maxConcurrency) {
    if (maxConcurrency <= 0) {
      throw new Error('Concurrency limit must be greater than 0');
    }
    this.maxConcurrency = maxConcurrency;
    this.running = 0;
    this.queue = [];
  }

  /**
   * Acquire a lock slot. Returns a release function when slot becomes available.
   * @returns {Promise<Function>} A function to release the acquired lock.
   */
  acquire() {
    return new Promise((resolve) => {
      const release = () => {
        this.running--;
        if (this.queue.length > 0) {
          const nextResolve = this.queue.shift();
          this.running++;
          nextResolve(release);
        }
      };

      if (this.running < this.maxConcurrency) {
        this.running++;
        resolve(release);
      } else {
        this.queue.push(resolve);
      }
    });
  }

  /**
   * Execute an async function within the concurrency limits of the semaphore.
   * Automatically handles acquiring and releasing.
   * @param {Function} task - Async task function returning a promise.
   * @returns {Promise<*>} The resolved output value of the task function.
   */
  async run(task) {
    const release = await this.acquire();
    try {
      return await task();
    } finally {
      release();
    }
  }
}
