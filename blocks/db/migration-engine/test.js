import { describe, it, expect } from '../../../test/test-harness.js';
import { MigrationEngine } from './index.js';

await describe('db/migration-engine', async () => {
  await it('should successfully run registered up and down migrations', async () => {
    // 1. Setup mock DB adapter
    const mockDb = {
      applied: [],
      tables: new Set(),
      async getAppliedMigrations() {
        return this.applied;
      },
      async markMigrationApplied(version) {
        this.applied.push(version);
      },
      async markMigrationRolledBack(version) {
        this.applied = this.applied.filter(v => v !== version);
      }
    };

    const engine = new MigrationEngine(mockDb);

    // 2. Register migrations
    engine.register(
      1,
      async (db) => { db.tables.add('users'); },
      async (db) => { db.tables.delete('users'); },
      'Create users table'
    );

    engine.register(
      2,
      async (db) => { db.tables.add('orders'); },
      async (db) => { db.tables.delete('orders'); },
      'Create orders table'
    );

    // 3. Migrate Up
    const runUp = await engine.up();
    expect(runUp.length).toBe(2);
    expect(runUp[0]).toBe(1);
    expect(runUp[1]).toBe(2);
    expect(mockDb.tables.has('users')).toBe(true);
    expect(mockDb.tables.has('orders')).toBe(true);

    // 4. Migrate Down by 1 step
    const runDown = await engine.down(1);
    expect(runDown.length).toBe(1);
    expect(runDown[0]).toBe(2);
    expect(mockDb.tables.has('users')).toBe(true);
    expect(mockDb.tables.has('orders')).toBe(false);
  });
});
