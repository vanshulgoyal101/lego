import { describe, it, expect } from '../../../test/test-harness.js';
import {VectorDb} from './index.js';

  await describe('db/vector-db', async () => {
    await it('should execute semantic nearest neighbor calculations and apply metadata predicates', () => {
      const db = new VectorDb();
      db.insert('item1', [1.0, 0.0, 0.0], { category: 'tech' });
      db.insert('item2', [0.0, 1.0, 0.0], { category: 'sports' });
      db.insert('item3', [0.9, 0.1, 0.0], { category: 'tech' });

      // Semantic Cosine search
      const query = [1.0, 0.1, 0.0];
      const results = db.query(query, 2, { metric: 'cosine', filter: { category: 'tech' } });
      expect(results.length).toBe(2);
      expect(results[0].id).toBe('item3'); // item3 has a slightly higher cosine similarity to the query [1.0, 0.1, 0.0]
      expect(results[1].id).toBe('item1');
    });
  });
