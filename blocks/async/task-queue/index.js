/**
 * Async Task Queue
 * Runs async tasks with a configurable concurrency limit.
 * Supports priority ordering, pause/resume, clearing pending tasks,
 * and an onDone callback that fires when the queue drains.
 */

/**
 * @typedef {Object} QueuedTask
 * @property {Function} fn - Async task function.
 * @property {number} priority - Higher number = higher priority.
 * @property {Function} resolve - Promise resolve.
 * @property {Function} reject - Promise reject.
 */

/**
 * An async task queue with concurrency control and priority support.
 *
 * @example
 * const queue = new TaskQueue(3); // up to 3 concurrent tasks
 * queue.onDone(() => console.log('All done!'));
 * await queue.add(() => fetchUser(1));
 * await queue.add(() => fetchUser(2), 10); // higher priority
 * await queue.run();
 */
export class TaskQueue {
  /**
   * @param {number} [concurrency=1] - Max simultaneous running tasks.
   */
  constructor(concurrency = 1) {
    if (concurrency < 1) throw new RangeError('Concurrency must be at least 1');
    /** @type {number} */
    this.concurrency = concurrency;
    /** @type {QueuedTask[]} */
    this._pending = [];
    /** @type {number} */
    this._running = 0;
    /** @type {boolean} */
    this._paused = false;
    /** @type {Function[]} */
    this._doneCallbacks = [];
  }

  /**
   * Add a task to the queue.
   * Returns a promise that resolves/rejects with the task's result.
   *
   * @param {() => Promise<*>} fn - Async function to enqueue.
   * @param {number} [priority=0] - Higher number = runs sooner.
   * @returns {Promise<*>} Resolves with the task's return value.
   */
  add(fn, priority = 0) {
    return new Promise((resolve, reject) => {
      this._pending.push({ fn, priority, resolve, reject });
      // Sort descending by priority
      this._pending.sort((a, b) => b.priority - a.priority);
      this._tick();
    });
  }

  /**
   * Process the queue — drains pending tasks respecting concurrency.
   * `add()` triggers this automatically; call `run()` after `resume()`.
   *
   * @returns {Promise<void>} Resolves when the queue is fully drained.
   */
  run() {
    this._tick();
    return this._waitForDrain();
  }

  /**
   * Pause queue processing. Currently running tasks are not interrupted.
   */
  pause() {
    this._paused = true;
  }

  /**
   * Resume queue processing after a pause.
   */
  resume() {
    this._paused = false;
    this._tick();
  }

  /**
   * Remove all pending (not yet started) tasks from the queue.
   * Their promises will be rejected with a 'cleared' error.
   */
  clear() {
    const cleared = this._pending.splice(0);
    for (const task of cleared) {
      task.reject(new Error('Task queue was cleared'));
    }
  }

  /**
   * Register a callback to fire whenever the queue becomes empty.
   * May fire multiple times if tasks are added after draining.
   *
   * @param {() => void} callback
   */
  onDone(callback) {
    if (typeof callback !== 'function') throw new TypeError('onDone callback must be a function');
    this._doneCallbacks.push(callback);
  }

  /**
   * Number of tasks currently pending (waiting to start).
   * @type {number}
   */
  get size() {
    return this._pending.length;
  }

  /**
   * Number of tasks currently executing.
   * @type {number}
   */
  get activeCount() {
    return this._running;
  }

  /** @private */
  _tick() {
    if (this._paused) return;
    while (this._running < this.concurrency && this._pending.length > 0) {
      const task = this._pending.shift();
      this._running++;
      this._execute(task);
    }
  }

  /** @private */
  async _execute(task) {
    try {
      const result = await task.fn();
      task.resolve(result);
    } catch (err) {
      task.reject(err);
    } finally {
      this._running--;
      this._tick();
      if (this._running === 0 && this._pending.length === 0) {
        for (const cb of this._doneCallbacks) {
          try { cb(); } catch { /* swallow */ }
        }
      }
    }
  }

  /** @private */
  _waitForDrain() {
    if (this._running === 0 && this._pending.length === 0) {
      return Promise.resolve();
    }
    return new Promise(resolve => {
      const check = () => {
        if (this._running === 0 && this._pending.length === 0) resolve();
        else this.onDone(check);
      };
      this.onDone(check);
    });
  }
}
