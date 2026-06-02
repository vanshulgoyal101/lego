import { describe, it, expect } from '../../../test/test-harness.js';
import { tarjanScc } from './index.js';

await describe('algo/tarjan-scc', async () => {
  await it('should partition graph nodes into strongly connected components', () => {
    const graph = {
      0: ['1'],
      1: ['2'],
      2: ['0', '3'],
      3: ['4'],
      4: ['5', '7'],
      5: ['6'],
      6: ['4'],
      7: []
    };

    const sccs = tarjanScc(graph);
    
    // Total components should be 4: {7}, {4,5,6}, {3}, {0,1,2}
    expect(sccs.length).toBe(4);
    
    // Verify each component by sorting its elements
    const sccStrings = sccs.map(c => c.sort().join(','));
    expect(sccStrings).toContain('7');
    expect(sccStrings).toContain('4,5,6');
    expect(sccStrings).toContain('3');
    expect(sccStrings).toContain('0,1,2');
  });
});
