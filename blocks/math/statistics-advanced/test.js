import { describe, it, expect } from '../../../test/test-harness.js';
import { StatisticsAdvanced } from './index.js';

await describe('math/statistics-advanced', async () => {
  await it('should correctly perform a t-test', () => {
    const sample1 = [2, 4, 4, 4, 5, 5, 7, 9];
    const sample2 = [1, 2, 2, 3, 3, 4, 5, 7, 8];

    const { tStatistic } = StatisticsAdvanced.tTest(sample1, sample2);
    // Expected mean1 = 5, mean2 = 3.888...
    // Let's verify t-statistic is computed correctly
    expect(tStatistic > 0).toBe(true);
    expect(Math.abs(tStatistic - 1.09) < 0.1).toBe(true);
  });

  await it('should correctly calculate one-way ANOVA F-statistic', () => {
    const groups = [
      [1, 2, 5],
      [2, 4, 2],
      [2, 3, 4]
    ];

    const { fStatistic, dfBetween, dfWithin } = StatisticsAdvanced.anova(groups);
    expect(dfBetween).toBe(2);
    expect(dfWithin).toBe(6);
    expect(fStatistic >= 0).toBe(true);
  });
});
