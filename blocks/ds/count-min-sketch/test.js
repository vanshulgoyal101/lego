import { describe, it, expect } from '../../../test/test-harness.js';
import { CountMinSketch } from './index.js';

await describe('ds/count-min-sketch', async () => {
  await it('should estimate item frequencies within reasonable accuracy bounds', () => {
    const cms = new CountMinSketch(100, 5);

    cms.add('apple', 10);
    cms.add('banana', 5);
    cms.add('orange', 1);

    expect(cms.estimate('apple')).toBe(10);
    expect(cms.estimate('banana')).toBe(5);
    expect(cms.estimate('orange')).toBe(1);
    expect(cms.estimate('grape')).toBe(0); // not added
  });
});
