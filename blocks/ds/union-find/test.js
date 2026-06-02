import { describe, it, expect } from '../../../test/test-harness.js';
import {UnionFind, createNumericUnionFind} from './index.js';

  await describe('ds/union-find', async () => {
    await it('should merge and query connected components', () => {
      const uf = new UnionFind();
      uf.add('A'); uf.add('B'); uf.add('C'); uf.add('D');
      expect(uf.connected('A', 'B')).toBe(false);
      uf.union('A', 'B');
      uf.union('B', 'C');
      expect(uf.connected('A', 'C')).toBe(true);
      expect(uf.connected('A', 'D')).toBe(false);
    });

    await it('should track component count', () => {
      const uf = new UnionFind();
      uf.add('X'); uf.add('Y'); uf.add('Z');
      expect(uf.componentCount).toBe(3);
      uf.union('X', 'Y');
      expect(uf.componentCount).toBe(2);
      uf.union('Y', 'Z');
      expect(uf.componentCount).toBe(1);
    });

    await it('should track component sizes correctly', () => {
      const uf = new UnionFind();
      uf.add(1); uf.add(2); uf.add(3);
      uf.union(1, 2);
      expect(uf.componentSize(1)).toBe(2);
      expect(uf.componentSize(3)).toBe(1);
    });

    await it('should enumerate all components', () => {
      const uf = createNumericUnionFind(4);
      uf.union(0, 1);
      uf.union(2, 3);
      const components = uf.getComponents();
      expect(components.length).toBe(2);
      const sizes = components.map(c => c.size).sort((a,b) => a-b);
      expect(sizes).toEqual([2, 2]);
    });

    await it('should handle idempotent unions (no double-counting)', () => {
      const uf = new UnionFind();
      uf.add('A'); uf.add('B');
      uf.union('A', 'B');
      uf.union('A', 'B'); // Already same set
      expect(uf.componentCount).toBe(1);
    });
  });
