import { describe, it, expect } from '../../../test/test-harness.js';
import { WAL } from './index.js';
import fs from 'fs/promises';

await describe('db/wal', async () => {
  await it('should log operations, recover them, and clear log correctly', async () => {
    const tempLog = './wal-test-temp.log';
    const wal = new WAL(tempLog);

    // Clean up if file exists from a previous run
    await wal.clear();

    // 1. Log operations
    await wal.append('put', 'username', 'alice');
    await wal.append('put', 'email', 'alice@example.com');
    await wal.append('delete', 'username', null);

    // 2. Recover and verify
    const entries = await wal.recover();
    expect(entries.length).toBe(3);

    expect(entries[0].op).toBe('put');
    expect(entries[0].key).toBe('username');
    expect(entries[0].val).toBe('alice');

    expect(entries[2].op).toBe('delete');
    expect(entries[2].key).toBe('username');
    expect(entries[2].val).toBe(null);

    // 3. Clear/Checkpoint
    await wal.clear();
    const emptyEntries = await wal.recover();
    expect(emptyEntries.length).toBe(0);
  });
});
