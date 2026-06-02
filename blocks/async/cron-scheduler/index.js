import { CronParser } from '../../validation/cron-parser/index.js';

/**
 * Task runner scheduling callbacks based on Cron interval patterns
 */
export class CronScheduler {
  constructor() {
    this.jobs = new Set();
  }

  /**
   * Schedule a job callback
   *
   * @param {string} cronPattern - Crontab timing pattern
   * @param {Function} callback - Callback function to run (sync or async)
   * @returns {Object} Job handle supporting .stop()
   */
  schedule(cronPattern, callback) {
    const parser = new CronParser(cronPattern);
    let timeoutId = null;
    let isStopped = false;

    const tick = () => {
      if (isStopped) return;

      const nextDate = parser.next();
      const delay = nextDate.getTime() - Date.now();

      timeoutId = setTimeout(async () => {
        try {
          await callback();
        } catch (err) {
          console.error('[CronScheduler Callback Error]:', err);
        }
        tick();
      }, Math.max(0, delay));
    };

    tick();

    const job = {
      stop: () => {
        isStopped = true;
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        this.jobs.delete(job);
      }
    };

    this.jobs.add(job);
    return job;
  }

  /**
   * Stop all scheduled background jobs
   */
  stopAll() {
    for (const job of this.jobs) {
      job.stop();
    }
  }
}
export default CronScheduler;
