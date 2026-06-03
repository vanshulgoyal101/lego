import { describe, it, expect } from '../../../test/test-harness.js';
import { FileWatcher } from './index.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const testDir = path.join(__dirname, 'temp_test_dir');

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

await describe('sys/file-watcher', async () => {
  // Setup temp directory
  try {
    await fs.mkdir(testDir, { recursive: true });
  } catch (err) {}

  await it('should watch a file using polling and report additions, changes, and deletions', async () => {
    const filePath = path.join(testDir, 'test_poll.txt');
    await fs.writeFile(filePath, 'initial');

    const watcher = new FileWatcher({ forcePolling: true, interval: 50 });
    const events = [];

    watcher.on('add', (p) => events.push({ type: 'add', path: p }));
    watcher.on('change', (p) => events.push({ type: 'change', path: p }));
    watcher.on('unlink', (p) => events.push({ type: 'unlink', path: p }));

    await watcher.watch(filePath);

    // Initial check (non-ignored initial event)
    expect(events.length).toBe(1);
    expect(events[0].type).toBe('add');

    // Trigger change
    await fs.writeFile(filePath, 'modified');
    await sleep(150);

    expect(events.length).toBe(2);
    expect(events[1].type).toBe('change');

    // Trigger delete
    await fs.unlink(filePath);
    await sleep(150);

    expect(events.length).toBe(3);
    expect(events[2].type).toBe('unlink');

    await watcher.close();
  });

  await it('should respect ignoreInitial option in polling', async () => {
    const filePath = path.join(testDir, 'test_poll_ignore.txt');
    await fs.writeFile(filePath, 'initial');

    const watcher = new FileWatcher({ forcePolling: true, interval: 50, ignoreInitial: true });
    const events = [];

    watcher.on('add', (p) => events.push({ type: 'add', path: p }));

    await watcher.watch(filePath);
    expect(events.length).toBe(0); // Should be ignored

    // Trigger change should still not be add
    await fs.writeFile(filePath, 'changed');
    await sleep(150);
    expect(events.length).toBe(0);

    // Create a NEW file in same directory? No, we watched the FILE path directly.
    await watcher.close();
    await fs.unlink(filePath);
  });

  // Cleanup temp directory
  try {
    await fs.rm(testDir, { recursive: true, force: true });
  } catch (err) {}
});
