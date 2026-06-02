import { describe, it, expect } from '../../../test/test-harness.js';
import {GraphDb} from './index.js';

  await describe('db/graph-db', async () => {
    await it('should support property nodes, edge links, shortest path, and transaction rollbacks', () => {
      const gdb = new GraphDb();
      
      const n1 = gdb.addNode('Person', { name: 'Alice' });
      const n2 = gdb.addNode('Person', { name: 'Bob' });
      const n3 = gdb.addNode('Person', { name: 'Charlie' });

      gdb.addEdge(n1.id, n2.id, 'FRIEND', {}, 10);
      gdb.addEdge(n2.id, n3.id, 'FRIEND', {}, 5);

      const path = gdb.shortestPath(n1.id, n3.id);
      expect(path.distance).toBe(15);
      expect(path.path).toEqual([n1.id, n2.id, n3.id]);

      // Rollback test
      gdb.beginTransaction();
      gdb.addNode('Person', { name: 'Temp' });
      expect(gdb.findNodes({ label: 'Person' }).length).toBe(4);
      gdb.rollback();
      expect(gdb.findNodes({ label: 'Person' }).length).toBe(3);
    });
  });
