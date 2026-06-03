import { describe, it, expect } from '../../../test/test-harness.js';
import { getProcessStats, ProcessWrapper } from './index.js';

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

await describe('sys/process-monitor', async () => {
  await it('should capture CPU and memory usage statistics', async () => {
    const stats1 = getProcessStats();
    expect(typeof stats1.memory.rss).toBe('number');
    expect(stats1.memory.rss).toBeGreaterThan(0);

    // Sleep to accumulate CPU time delta
    await sleep(50);
    const stats2 = getProcessStats(stats1);
    expect(typeof stats2.cpuPercent).toBe('number');
    expect(stats2.cpuPercent).toBeGreaterThanOrEqual(0);
  });

  await it('should wrap and capture a child process exit and output', async () => {
    // Run simple node script that prints to stdout and exit
    const script = `console.log("hello stdout"); console.error("hello stderr"); process.exit(42);`;
    const wrapper = new ProcessWrapper('node', ['-e', script]);

    const exitPromise = new Promise((resolve) => {
      wrapper.on('exit', (code) => resolve(code));
    });

    wrapper.start();
    const code = await exitPromise;

    expect(code).toBe(42);
    expect(wrapper.getStdout().trim()).toBe('hello stdout');
    expect(wrapper.getStderr().trim()).toBe('hello stderr');

    const status = wrapper.getStatus();
    expect(status.started).toBe(true);
    expect(status.finished).toBe(true);
    expect(status.exitCode).toBe(42);
  });

  await it('should enforce timeout limits', async () => {
    // Run process that sleeps for a long time
    const script = `setTimeout(() => {}, 10000);`;
    const wrapper = new ProcessWrapper('node', ['-e', script], { timeout: 100 });
    wrapper.on('error', () => {}); // Prevent unhandled error event crash

    const exitPromise = new Promise((resolve) => {
      wrapper.on('exit', () => resolve(true));
    });

    wrapper.start();
    await exitPromise;

    const status = wrapper.getStatus();
    expect(status.finished).toBe(true);
    expect(status.error).toContain('timed out');
  });

  await it('should enforce maxBuffer size limits', async () => {
    const script = `console.log("x".repeat(2000));`;
    const wrapper = new ProcessWrapper('node', ['-e', script], { maxBuffer: 500 });
    wrapper.on('error', () => {}); // Prevent unhandled error event crash

    const exitPromise = new Promise((resolve) => {
      wrapper.on('exit', () => resolve(true));
    });

    wrapper.start();
    await exitPromise;

    const status = wrapper.getStatus();
    expect(status.finished).toBe(true);
    expect(status.error).toContain('maxBuffer size exceeded');
  });
});
