import { describe, it, expect } from '../../../test/test-harness.js';
import { knapsack } from './index.js';

await describe('algo/knapsack', async () => {
  await it('should maximise value without exceeding capacity', () => {
    const items = [
      { weight: 10, value: 60, name: 'Gold' },
      { weight: 20, value: 100, name: 'Silver' },
      { weight: 30, value: 120, name: 'Bronze' },
    ];
    const { maxValue, selectedItems } = knapsack(50, items);
    expect(maxValue).toBe(220);
    const names = selectedItems.map(i => i.name).sort();
    expect(names).toEqual(['Bronze', 'Silver']);
  });

  await it('should handle a single item that fits', () => {
    const { maxValue, selectedItems } = knapsack(10, [{ weight: 5, value: 50 }]);
    expect(maxValue).toBe(50);
    expect(selectedItems.length).toBe(1);
  });

  await it('should handle a single item that does not fit', () => {
    const { maxValue, selectedItems } = knapsack(4, [{ weight: 5, value: 50 }]);
    expect(maxValue).toBe(0);
    expect(selectedItems.length).toBe(0);
  });

  await it('should return zero value for empty items list', () => {
    const { maxValue, selectedItems } = knapsack(100, []);
    expect(maxValue).toBe(0);
    expect(selectedItems).toEqual([]);
  });

  await it('should return zero for zero capacity', () => {
    const items = [{ weight: 1, value: 100 }];
    const { maxValue } = knapsack(0, items);
    expect(maxValue).toBe(0);
  });

  await it('should pick items optimally from many choices', () => {
    const items = [
      { weight: 2, value: 6 },
      { weight: 2, value: 10 },
      { weight: 3, value: 12 },
    ];
    const { maxValue } = knapsack(5, items);
    expect(maxValue).toBe(22);
  });

  await it('should not mutate the input items array', () => {
    const items = [{ weight: 1, value: 10 }, { weight: 2, value: 20 }];
    const copy = JSON.stringify(items);
    knapsack(3, items);
    expect(JSON.stringify(items)).toBe(copy);
  });
});
