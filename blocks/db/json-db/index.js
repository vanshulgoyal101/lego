import fs from 'fs/promises';
import path from 'path';

/**
 * A lightweight, transactional file-backed JSON database.
 * Designed to hold small local datasets, state files, or memory indexes.
 * Employs a swap-file write pattern to prevent file corruption during failure events.
 */
export class JsonDatabase {
  /**
   * @param {string} filepath - Path to the database JSON file.
   */
  constructor(filepath) {
    this.filepath = path.resolve(filepath);
    this.lockPromise = Promise.resolve();
  }

  /**
   * Internal helper to queue actions sequentially to avoid concurrent file write collisions.
   * @private
   */
  async _queue(action) {
    const nextLock = this.lockPromise.then(action);
    this.lockPromise = nextLock.catch(() => {});
    return nextLock;
  }

  /**
   * Internal read without lock queueing.
   * @private
   */
  async _readRaw() {
    try {
      const data = await fs.readFile(this.filepath, 'utf8');
      return JSON.parse(data);
    } catch (err) {
      if (err.code === 'ENOENT') {
        // Return blank database structure if file doesn't exist
        return { tables: {} };
      }
      throw err;
    }
  }

  /**
   * Internal write using a temporary swap file to prevent corruption on crash.
   * @private
   */
  async _writeRaw(data) {
    const dir = path.dirname(this.filepath);
    await fs.mkdir(dir, { recursive: true });

    const tempFile = `${this.filepath}.tmp`;
    await fs.writeFile(tempFile, JSON.stringify(data, null, 2), 'utf8');
    await fs.rename(tempFile, this.filepath);
  }

  /**
   * Read all records from a specific table.
   * @param {string} tableName
   * @returns {Promise<Array>} List of records.
   */
  async findMany(tableName) {
    return this._queue(async () => {
      const db = await this._readRaw();
      return db.tables[tableName] || [];
    });
  }

  /**
   * Find records matching a specific query filter.
   * @param {string} tableName
   * @param {Object} query - Key-value map to filter by.
   * @returns {Promise<Array>} Matching records.
   */
  async find(tableName, query = {}) {
    return this._queue(async () => {
      const db = await this._readRaw();
      const records = db.tables[tableName] || [];
      return records.filter(record => 
        Object.entries(query).every(([key, value]) => record[key] === value)
      );
    });
  }

  /**
   * Insert a new record into a table. Auto-generates an auto-incrementing ID.
   * @param {string} tableName
   * @param {Object} record - Record data.
   * @returns {Promise<Object>} The inserted record with assigned ID.
   */
  async insert(tableName, record) {
    return this._queue(async () => {
      const db = await this._readRaw();
      if (!db.tables[tableName]) {
        db.tables[tableName] = [];
      }

      // Calculate next incrementing ID
      const records = db.tables[tableName];
      const maxId = records.reduce((max, r) => (r.id > max ? r.id : max), 0);
      const newRecord = { id: maxId + 1, ...record };

      records.push(newRecord);
      await this._writeRaw(db);
      return newRecord;
    });
  }

  /**
   * Update records in a table matching a search filter.
   * @param {string} tableName
   * @param {Object} query - Search criteria.
   * @param {Object} updates - Properties to merge.
   * @returns {Promise<number>} Number of updated records.
   */
  async update(tableName, query, updates) {
    return this._queue(async () => {
      const db = await this._readRaw();
      const records = db.tables[tableName] || [];
      let updatedCount = 0;

      const updatedRecords = records.map(record => {
        const matches = Object.entries(query).every(([k, v]) => record[k] === v);
        if (matches) {
          updatedCount++;
          // Prevent overwriting the ID
          const cleanUpdates = { ...updates };
          delete cleanUpdates.id;
          return { ...record, ...cleanUpdates };
        }
        return record;
      });

      if (updatedCount > 0) {
        db.tables[tableName] = updatedRecords;
        await this._writeRaw(db);
      }

      return updatedCount;
    });
  }

  /**
   * Delete records from a table matching a search filter.
   * @param {string} tableName
   * @param {Object} query - Search criteria.
   * @returns {Promise<number>} Number of deleted records.
   */
  async delete(tableName, query) {
    return this._queue(async () => {
      const db = await this._readRaw();
      const records = db.tables[tableName] || [];
      const initialCount = records.length;

      const filteredRecords = records.filter(record => 
        !Object.entries(query).every(([k, v]) => record[k] === v)
      );

      const deletedCount = initialCount - filteredRecords.length;

      if (deletedCount > 0) {
        db.tables[tableName] = filteredRecords;
        await this._writeRaw(db);
      }

      return deletedCount;
    });
  }
}
