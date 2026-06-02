import { describe, it, expect } from '../../../test/test-harness.js';
import {SqlQueryBuilder} from './index.js';

  await describe('ui/query-builder', async () => {
    await it('should build SELECT strings with parameter bindings', async () => {
      const q = new SqlQueryBuilder('tbl')
        .select('c1', 'c2')
        .where('status', 'active')
        .build();
      expect(q.sql).toBe('SELECT c1, c2 FROM tbl WHERE status = ?');
      expect(q.values[0]).toBe('active');
    });
  });
