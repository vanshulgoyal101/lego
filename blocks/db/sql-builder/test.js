import { describe, it, expect } from '../../../test/test-harness.js';
import { SQLBuilder } from './index.js';

await describe('db/sql-builder', async () => {
  await it('should correctly generate SELECT queries with constraints and joins', () => {
    const builder = new SQLBuilder();

    const sql = builder
      .select('u.id', 'u.name', 'p.title')
      .from('users u')
      .join('posts p', 'u.id = p.user_id', 'LEFT')
      .where('u.status', 'active')
      .where('p.views', '>', 100)
      .orderBy('p.created_at', 'DESC')
      .limit(5)
      .build();

    const expected = "SELECT u.id, u.name, p.title FROM users u LEFT JOIN posts p ON u.id = p.user_id WHERE u.status = 'active' AND p.views > 100 ORDER BY p.created_at DESC LIMIT 5";
    expect(sql).toBe(expected);
  });

  await it('should generate valid INSERT queries', () => {
    const builder = new SQLBuilder();
    const sql = builder
      .insert('users', { name: "O'Connor", age: 30, active: true })
      .build();

    const expected = "INSERT INTO users (name, age, active) VALUES ('O''Connor', 30, 1)";
    expect(sql).toBe(expected);
  });

  await it('should generate valid UPDATE queries', () => {
    const builder = new SQLBuilder();
    const sql = builder
      .update('users', { status: 'suspended' })
      .where('id', 123)
      .build();

    const expected = "UPDATE users SET status = 'suspended' WHERE id = 123";
    expect(sql).toBe(expected);
  });

  await it('should generate valid DELETE queries', () => {
    const builder = new SQLBuilder();
    const sql = builder
      .delete('users')
      .where('active', false)
      .build();

    const expected = "DELETE FROM users WHERE active = 0";
    expect(sql).toBe(expected);
  });
});
