export class MigrationEngine {
  /**
   * @param {Object} dbClient - A database adapter or client mock
   * @param {Function} dbClient.getAppliedMigrations - Async function returning version numbers
   * @param {Function} dbClient.markMigrationApplied - Async function marking a version applied
   * @param {Function} dbClient.markMigrationRolledBack - Async function marking a version unapplied
   */
  constructor(dbClient) {
    this.db = dbClient;
    this.migrations = new Map(); // version -> { up, down, description }
  }

  /**
   * Register a new migration.
   */
  register(version, up, down, description = '') {
    if (typeof version !== 'number' || version <= 0) {
      throw new Error('Migration version must be a positive number');
    }
    if (this.migrations.has(version)) {
      throw new Error(`Migration version ${version} is already registered`);
    }
    this.migrations.set(version, { up, down, description });
  }

  /**
   * Runs all pending migrations.
   */
  async up(steps = Infinity) {
    const applied = new Set(await this.db.getAppliedMigrations());
    const versions = Array.from(this.migrations.keys()).sort((a, b) => a - b);
    const executed = [];

    let count = 0;
    for (const v of versions) {
      if (count >= steps) break;
      if (!applied.has(v)) {
        const { up } = this.migrations.get(v);
        await up(this.db);
        await this.db.markMigrationApplied(v);
        executed.push(v);
        count++;
      }
    }
    return executed;
  }

  /**
   * Rolls back the last N applied migrations.
   */
  async down(steps = 1) {
    const appliedList = await this.db.getAppliedMigrations();
    // Sort applied versions descending to roll back the newest first
    const applied = appliedList.slice().sort((a, b) => b - a);
    const executed = [];

    let count = 0;
    for (const v of applied) {
      if (count >= steps) break;
      if (this.migrations.has(v)) {
        const { down } = this.migrations.get(v);
        await down(this.db);
        await this.db.markMigrationRolledBack(v);
        executed.push(v);
        count++;
      }
    }
    return executed;
  }
}
