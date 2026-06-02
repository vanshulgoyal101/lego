import { describe, it, expect } from '../../../test/test-harness.js';
import {parseSql} from './index.js';

  await describe('compiler/sql-query-parser', async () => {
    await it('should parse SELECT columns, aliases, INNER JOINs, and WHERE logical conditions', () => {
      const sql = 'SELECT users.name AS userName, orders.total FROM users INNER JOIN orders ON users.id = orders.user_id WHERE users.age >= 18 AND orders.status = "paid" LIMIT 10';
      const ast = parseSql(sql);
      expect(ast.type).toBe('SELECT');
      expect(ast.fields[0].name).toBe('users.name');
      expect(ast.fields[0].alias).toBe('userName');
      expect(ast.from).toBe('users');
      expect(ast.joins[0].type).toBe('INNER');
      expect(ast.joins[0].table).toBe('orders');
      expect(ast.joins[0].condition.left).toBe('users.id');
      expect(ast.joins[0].condition.right).toBe('orders.user_id');
      expect(ast.limit).toBe(10);
    });
  });
