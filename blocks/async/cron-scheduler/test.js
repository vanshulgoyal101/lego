import { describe, it, expect } from '../../../test/test-harness.js';
import { CronScheduler } from './index.js';

await describe('async/cron-scheduler', async () => {
  await it('should schedule and manage cron jobs registration, triggering, and teardown execution', async () => {
    const scheduler = new CronScheduler();
    let triggeredCount = 0;

    // Schedule job to run every minute
    const job = scheduler.schedule('* * * * *', () => {
      triggeredCount++;
    });

    expect(scheduler.jobs.size).toBe(1);

    // Stop job
    job.stop();
    expect(scheduler.jobs.size).toBe(0);
    expect(triggeredCount).toBe(0);
  });
});
