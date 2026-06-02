import { describe, it, expect } from '../../../test/test-harness.js';
import { TaskQueue } from './index.js';

const sleep = ms => new Promise(r => setTimeout(r, ms));

await describe('async/task-queue', async () => {
  await it('should run tasks and return results', async () => {
    const queue = new TaskQueue(2);
    const r1 = queue.add(() => Promise.resolve(1));
    const r2 = queue.add(() => Promise.resolve(2));
    expect(await r1).toBe(1);
    expect(await r2).toBe(2);
  });

  await it('should respect concurrency limit', async () => {
    const queue = new TaskQueue(2);
    let concurrent = 0;
    let maxConcurrent = 0;

    const task = () => async () => {
      concurrent++;
      maxConcurrent = Math.max(maxConcurrent, concurrent);
      await sleep(20);
      concurrent--;
    };

    await Promise.all([
      queue.add(task()),
      queue.add(task()),
      queue.add(task()),
      queue.add(task()),
    ]);

    expect(maxConcurrent).toBe(2);
  });

  await it('should respect priority ordering', async () => {
    const queue = new TaskQueue(1);
    const order = [];

    // Fill the single slot with a slow task
    const slow = queue.add(async () => { await sleep(20); order.push(0); });
    // Add lower-priority task first
    queue.add(async () => { order.push(1); }, 1);
    // Add higher-priority task second
    queue.add(async () => { order.push(2); }, 10);

    await slow;
    await queue.run();

    // Higher priority (10) should run before lower priority (1)
    expect(order[1]).toBe(2);
    expect(order[2]).toBe(1);
  });

  await it('should call onDone when queue drains', async () => {
    const queue = new TaskQueue(2);
    let called = false;
    queue.onDone(() => { called = true; });
    await queue.add(() => Promise.resolve(42));
    await queue.run();
    expect(called).toBe(true);
  });

  await it('pause and resume should work correctly', async () => {
    const queue = new TaskQueue(2);
    const results = [];
    queue.pause();
    queue.add(async () => { results.push(1); });
    queue.add(async () => { results.push(2); });
    // Nothing should have run yet
    expect(results.length).toBe(0);
    queue.resume();
    await queue.run();
    expect(results.length).toBe(2);
  });

  await it('clear should reject pending tasks', async () => {
    const queue = new TaskQueue(1);
    // Block the slot
    queue.add(() => sleep(50));
    // Pending task
    const p = queue.add(() => Promise.resolve(99));
    queue.clear();
    let rejected = false;
    try { await p; } catch { rejected = true; }
    expect(rejected).toBe(true);
  });

  await it('size and activeCount should be accurate', async () => {
    const queue = new TaskQueue(1);
    queue.pause();
    queue.add(() => sleep(10));
    queue.add(() => sleep(10));
    expect(queue.size).toBe(2);
    expect(queue.activeCount).toBe(0);
  });

  await it('should propagate task errors', async () => {
    const queue = new TaskQueue(1);
    let caught = null;
    try {
      await queue.add(() => Promise.reject(new Error('oops')));
    } catch (err) {
      caught = err;
    }
    expect(caught).toBeTruthy();
    expect(caught.message).toBe('oops');
  });
});
