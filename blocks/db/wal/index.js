import fs from 'fs/promises';
import path from 'path';

/**
 * Write-Ahead Log (WAL) Manager
 */
export class WAL {
  /**
   * @param {string} logPath - Path to the append-only log file on disk
   */
  constructor(logPath) {
    if (!logPath) {
      throw new Error('InvalidInput: logPath must be specified.');
    }
    this.logPath = path.resolve(logPath);
  }

  /**
   * Append a database operation to the log
   *
   * @param {string} op - 'put' | 'delete'
   * @param {string} key
   * @param {string|null} val
   */
  async append(op, key, val) {
    // Ensure parent directory exists
    const dir = path.dirname(this.logPath);
    await fs.mkdir(dir, { recursive: true });

    const entry = JSON.stringify({ op, key, val, time: Date.now() }) + '\n';
    await fs.appendFile(this.logPath, entry, 'utf8');
  }

  /**
   * Read the log and return the array of entries for crash recovery
   *
   * @returns {Promise<Array>} Array of deserialized log entries
   */
  async recover() {
    try {
      const data = await fs.readFile(this.logPath, 'utf8');
      return data
        .split('\n')
        .filter(line => line.trim() !== '')
        .map(line => JSON.parse(line));
    } catch (err) {
      if (err.code === 'ENOENT') {
        return []; // No log file to recover from
      }
      throw err;
    }
  }

  /**
   * Clear / Truncate the log (called during checkpointing)
   */
  async clear() {
    try {
      await fs.unlink(this.logPath);
    } catch (err) {
      if (err.code !== 'ENOENT') throw err;
    }
  }
}
